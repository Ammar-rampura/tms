import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { ProfileCard } from '@/components/ProfileCard'
import { StudentIdCard } from '@/components/StudentIdCard'
import { IdCard } from 'lucide-react'
import { FeeCard } from '@/components/FeeCard'
import { FeeStatusBadge } from '@/components/StatusBadge'
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/Skeleton'
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MARAHIL } from '@/lib/quran'
import { formatCurrency } from '@/lib/utils'
import { db } from '@/lib/db'
import type { Program, FeeRecord, PaymentRecord } from '@/types'
import { toast } from 'sonner'

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
]

export function JanabStudentProfile() {
  const { id } = useParams<{ id: string }>()
  const { students, loading, updateStudent, deleteStudent } = useData()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    name: '', age: 0, mobile: '', fatherName: '', fatherIts: '', motherName: '', motherIts: '', fatherMobile: '', motherMobile: '', email: '', address: '', program: 'Tahfeez' as Program, completedJuz: [] as number[], remarks: '', monthlyFee: 0, status: 'active' as 'active' | 'inactive', itsPassword: ''
  })

  // Fee state for active billing month & records
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeFeeRecord, setActiveFeeRecord] = useState<FeeRecord | null>(null)
  const [studentFeeRecords, setStudentFeeRecords] = useState<FeeRecord[]>([])
  const [feeLoading, setFeeLoading] = useState(false)
  const [feeHistoryOpen, setFeeHistoryOpen] = useState(false)

  // Edit Fee Dialog state
  const [editFeeActive, setEditFeeActive] = useState<FeeRecord | null>(null)
  const [editOriginalFee, setEditOriginalFee] = useState(0)
  const [editScholarship, setEditScholarship] = useState(0)
  const [editIsSkipped, setEditIsSkipped] = useState(false)
  const [savingFee, setSavingFee] = useState(false)

  const student = students.find((s) => s.id === id)

  // Initialize active billing period from settings / fee_records
  useEffect(() => {
    let isMounted = true
    db.getActiveBillingPeriod().then((period) => {
      if (isMounted) {
        setSelectedMonth(period.month)
        setSelectedYear(period.year)
      }
    }).catch((err) => {
      console.error('Failed to get active billing period:', err)
    })
    return () => { isMounted = false }
  }, [])

  // Load fee record for selected month and all fee records for this student
  const loadFeeData = async (studentId: string, month: number, year: number) => {
    setFeeLoading(true)
    try {
      const [monthlyRec, allRecs] = await Promise.all([
        db.getStudentFeeRecordByMonth(studentId, month, year),
        db.getStudentFeeRecords(studentId)
      ])
      setActiveFeeRecord(monthlyRec)
      setStudentFeeRecords(allRecs)
    } catch (err) {
      console.error('Failed to load student fee records:', err)
    } finally {
      setFeeLoading(false)
    }
  }

  useEffect(() => {
    if (student?.id) {
      loadFeeData(student.id, selectedMonth, selectedYear)
    }
  }, [student?.id, selectedMonth, selectedYear])

  // Derive consolidated payment history from fee_records + student.paymentHistory
  const paymentHistory: PaymentRecord[] = useMemo(() => {
    const list: PaymentRecord[] = []
    for (const r of studentFeeRecords) {
      if (r.paidAmount > 0) {
        list.push({
          id: r.id,
          date: r.paymentDate || r.billingDate || new Date().toISOString(),
          amount: r.paidAmount,
          note: `${r.paymentMethod || 'Cash'} - ${MONTHS[r.billingMonth - 1]} ${r.billingYear}${r.remark ? ` (${r.remark})` : ''}`
        })
      }
    }

    if (student?.paymentHistory) {
      const existingIds = new Set(list.map((p) => p.id))
      for (const p of student.paymentHistory) {
        if (!existingIds.has(p.id)) {
          list.push(p)
        }
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [studentFeeRecords, student?.paymentHistory])

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        age: student.age,
        itsPassword: student.itsPassword || '',
        mobile: student.mobile,
        fatherName: student.fatherName,
        fatherIts: student.fatherIts || '',
        motherName: student.motherName,
        motherIts: student.motherIts || '',
        fatherMobile: student.fatherMobile,
        motherMobile: student.motherMobile,
        email: student.email,
        address: student.address,
        program: student.program,
        completedJuz: student.completedJuz || [],
        remarks: student.remarks ?? '',
        monthlyFee: student.monthlyFee,
        status: student.status,
      })
    }
  }, [student?.id])

  const openEditFeeDialog = (record: FeeRecord) => {
    setEditFeeActive(record)
    setEditOriginalFee(record.originalFee)
    setEditScholarship(record.scholarshipAmount)
    setEditIsSkipped(record.status === 'Skipped')
  }

  const calculatedPayable = editIsSkipped ? 0 : Math.max(0, editOriginalFee - editScholarship)

  async function handleSaveFee() {
    if (!editFeeActive) return

    if (editScholarship < 0 || editScholarship > editOriginalFee) {
      toast.error('Scholarship cannot be less than 0 or greater than original fee.')
      return
    }

    if (!editIsSkipped && calculatedPayable < editFeeActive.paidAmount) {
      toast.error(`Payable amount (${formatCurrency(calculatedPayable)}) cannot be less than the amount already paid (${formatCurrency(editFeeActive.paidAmount)}).`)
      return
    }

    setSavingFee(true)
    try {
      await db.updateMonthlyFeeDetails(editFeeActive.id, editOriginalFee, editScholarship, editIsSkipped)
      toast.success('Fee record updated successfully')
      setEditFeeActive(null)
      if (student?.id) {
        await loadFeeData(student.id, selectedMonth, selectedYear)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update fee record')
    } finally {
      setSavingFee(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!student) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-16 text-center">
        <p className="font-medium text-ink/60 dark:text-primary-100/60">Student not found.</p>
        <Link to="/janab/students"><Button variant="outline">Back to Students</Button></Link>
      </div>
    )
  }

  async function handleSave() {
    await updateStudent(student!.id, { ...form, age: Number(form.age), monthlyFee: Number(form.monthlyFee) })
    toast.success('Profile updated successfully')
  }

  async function handleDelete() {
    await deleteStudent(student!.id)
    toast.success('Student record deleted')
    navigate('/janab/students')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/janab/students" className="flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink dark:text-primary-100/55">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" /> Delete Student
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard student={student} />
          <FeeCard
          student={student}
          feeRecord={activeFeeRecord}
          monthLabel={`Showing ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          onEditFee={openEditFeeDialog}
          onViewHistory={() => setFeeHistoryOpen(true)}
          monthSelector={
            <div className="flex items-center gap-1.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-7 rounded-lg border border-primary-900/15 bg-white/80 px-2 text-xs font-medium dark:border-primary-100/15 dark:bg-primary-900/50"
                title="Select billing month"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-7 rounded-lg border border-primary-900/15 bg-white/80 px-2 text-xs font-medium dark:border-primary-100/15 dark:bg-primary-900/50"
                title="Select billing year"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          }
        />
        </div>
        <div className="lg:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <IdCard className="h-4 w-4 text-primary-600 dark:text-brass-400" />
            <h3 className="font-display text-base font-semibold text-ink dark:text-primary-50">Student ID Card</h3>
          </div>
          <StudentIdCard student={student} />
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-ink dark:text-primary-50">Edit Profile</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <div>
            <Label>ITS Password</Label>
            <Input value={form.itsPassword} onChange={(e) => setForm({ ...form, itsPassword: e.target.value })} />
          </div>
          <div>
            <Label>Mobile Number</Label>
            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div>
            <Label>Father's Name</Label>
            <Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
          </div>
          <div>
            <Label>Father's ITS</Label>
            <Input value={form.fatherIts} onChange={(e) => setForm({ ...form, fatherIts: e.target.value })} />
          </div>
          <div>
            <Label>Mother's Name</Label>
            <Input value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
          </div>
          <div>
            <Label>Mother's ITS</Label>
            <Input value={form.motherIts} onChange={(e) => setForm({ ...form, motherIts: e.target.value })} />
          </div>
          <div>
            <Label>Father's Mobile Number</Label>
            <Input value={form.fatherMobile} onChange={(e) => setForm({ ...form, fatherMobile: e.target.value })} />
          </div>
          <div>
            <Label>Mother's Mobile Number</Label>
            <Input value={form.motherMobile} onChange={(e) => setForm({ ...form, motherMobile: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Program</Label>
            <select
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value as Program })}
              className="h-11 w-full rounded-xl border border-primary-900/12 bg-white/70 px-3.5 text-sm dark:border-primary-100/12 dark:bg-primary-900/40"
            >
              <option value="Tahfeez">Tahfeez</option>
              <option value="Taiseer">Taiseer</option>
              <option value="Atfaal">Atfaal</option>
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
              className="h-11 w-full rounded-xl border border-primary-900/12 bg-white/70 px-3.5 text-sm dark:border-primary-100/12 dark:bg-primary-900/40"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>Quran Details</Label>
            <div className="mt-2 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {MARAHIL.map((m) => (
                <div key={m.id} className="rounded-xl border border-primary-900/10 p-4 dark:border-primary-100/10">
                  <h4 className="mb-2 font-display font-semibold text-ink dark:text-primary-50">{m.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {m.juz.map((j) => {
                      const isChecked = form.completedJuz.includes(j)
                      return (
                        <label key={j} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary-900/10 bg-white/50 px-2.5 py-1.5 text-sm hover:bg-primary-900/5 dark:border-primary-100/10 dark:bg-primary-900/20 dark:hover:bg-primary-100/5">
                          <input
                            type="checkbox"
                            className="accent-primary-600"
                            checked={isChecked}
                            onChange={() => {
                              const newJuz = isChecked 
                                ? form.completedJuz.filter(x => x !== j)
                                : [...form.completedJuz, j];
                              setForm({ ...form, completedJuz: newJuz });
                            }}
                          />
                          <span className={isChecked ? 'text-ink font-medium dark:text-primary-50' : 'text-ink/60 dark:text-primary-100/60'}>
                            Juz {j}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>Remarks</Label>
            <Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>
        </div>
        <Button className="mt-5" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="card-surface p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-ink dark:text-primary-50">Payment History</h3>
        <PaymentHistoryTable history={paymentHistory} />
      </div>

      {/* Edit Fee Dialog */}
      <Dialog open={!!editFeeActive} onOpenChange={(open) => !open && setEditFeeActive(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Fee Details</DialogTitle>
          <DialogDescription>
            {student.name} • {MONTHS[selectedMonth - 1]} {selectedYear}
          </DialogDescription>

          {editFeeActive && (
            <div className="mt-5 space-y-5">
              {editFeeActive.paidAmount > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/[0.08] p-3 text-red-700 dark:text-red-300/90 text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>
                    <strong>Warning:</strong> Payments (₹{editFeeActive.paidAmount}) have already been recorded for this month. 
                    You cannot reduce the payable amount below the paid amount.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl border border-primary-900/10 dark:border-primary-100/10 bg-primary-900/[0.02] dark:bg-primary-100/[0.02]">
                <Label htmlFor="profile-skip-fee" className="font-semibold cursor-pointer">Skip Fee For This Month</Label>
                <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full">
                  <input
                    id="profile-skip-fee"
                    type="checkbox"
                    checked={editIsSkipped}
                    onChange={(e) => setEditIsSkipped(e.target.checked)}
                    className="peer sr-only"
                    disabled={savingFee}
                  />
                  <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-input transition-colors peer-checked:bg-primary-600"></span>
                  <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-primary-200 bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                </div>
              </div>

              {!editIsSkipped && (
                <>
                  <div>
                    <Label>Original Fee (₹)</Label>
                    <Input
                      type="number"
                      value={editOriginalFee}
                      onChange={(e) => setEditOriginalFee(Number(e.target.value))}
                      min={0}
                      disabled={savingFee}
                    />
                  </div>

                  <div>
                    <Label>Scholarship Amount (₹)</Label>
                    <Input
                      type="number"
                      value={editScholarship}
                      onChange={(e) => setEditScholarship(Number(e.target.value))}
                      min={0}
                      max={editOriginalFee}
                      disabled={savingFee}
                    />
                  </div>
                </>
              )}

              <div className="rounded-xl bg-primary-500/[0.08] p-4 text-center mt-6">
                <p className="text-[11px] uppercase tracking-wide text-primary-700 dark:text-primary-200/70">Calculated Payable Amount</p>
                <p className="mt-1 font-mono text-2xl font-bold text-primary-700 dark:text-primary-200">
                  {formatCurrency(calculatedPayable)}
                </p>
              </div>

              <Button className="w-full relative" variant="brass" onClick={handleSaveFee} disabled={savingFee}>
                {savingFee ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : 'Save Fee Details'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fee History Dialog */}
      <Dialog open={feeHistoryOpen} onOpenChange={setFeeHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div>
            <DialogTitle className="text-xl">Fee History</DialogTitle>
            <DialogDescription>
              {student.name} • ITS: {student.its} • Complete record of all monthly fee billings and payments
            </DialogDescription>
          </div>

          {/* Overall History Summary Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-4">
            <div className="rounded-xl bg-primary-900/[0.03] dark:bg-primary-100/[0.04] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Total Months Billed</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink dark:text-primary-50">
                {studentFeeRecords.length}
              </p>
            </div>
            <div className="rounded-xl bg-primary-900/[0.03] dark:bg-primary-100/[0.04] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Total Payable</p>
              <p className="mt-1 font-mono text-lg font-bold text-ink dark:text-primary-50">
                {formatCurrency(studentFeeRecords.reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="rounded-xl bg-primary-500/[0.08] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-primary-700 dark:text-primary-200/70">Total Paid</p>
              <p className="mt-1 font-mono text-lg font-bold text-primary-700 dark:text-primary-200">
                {formatCurrency(studentFeeRecords.reduce((sum, r) => sum + r.paidAmount, 0))}
              </p>
            </div>
            <div className="rounded-xl bg-red-500/[0.07] p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-red-600/80 dark:text-red-300/70">Total Outstanding Due</p>
              <p className="mt-1 font-mono text-lg font-bold text-red-600 dark:text-red-300">
                {formatCurrency(studentFeeRecords.reduce((sum, r) => sum + (r.status === 'Skipped' ? 0 : Math.max(0, r.amount - r.paidAmount)), 0))}
              </p>
            </div>
          </div>

          {/* Historical Records Table */}
          {studentFeeRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-900/15 py-12 text-center mt-4">
              <p className="text-sm font-medium text-ink/60 dark:text-primary-100/60">No monthly fee records generated yet</p>
              <p className="text-xs text-ink/40 dark:text-primary-100/40 mt-1">Monthly fee records will appear here once generated.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-primary-900/10 dark:border-primary-100/10">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-primary-900/10 bg-primary-900/[0.03] text-left text-xs uppercase tracking-wide text-ink/50 dark:border-primary-100/10 dark:bg-primary-100/[0.04] dark:text-primary-100/50">
                    <th className="px-3.5 py-3 font-semibold">Month</th>
                    <th className="px-3.5 py-3 font-semibold">Original Fee</th>
                    <th className="px-3.5 py-3 font-semibold text-red-500">Scholarship</th>
                    <th className="px-3.5 py-3 font-semibold text-primary-600 dark:text-primary-300">Payable</th>
                    <th className="px-3.5 py-3 font-semibold">Paid</th>
                    <th className="px-3.5 py-3 font-semibold">Due</th>
                    <th className="px-3.5 py-3 font-semibold">Status</th>
                    <th className="px-3.5 py-3 font-semibold">Payment Info</th>
                    <th className="px-3.5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFeeRecords.map((record) => {
                    const due = record.status === 'Skipped' ? 0 : Math.max(0, record.amount - record.paidAmount)
                    const isViewing = record.billingMonth === selectedMonth && record.billingYear === selectedYear
                    return (
                      <tr 
                        key={record.id}
                        className={`border-b border-primary-900/[0.05] last:border-0 hover:bg-primary-900/[0.02] dark:border-primary-100/[0.06] dark:hover:bg-primary-100/[0.03] ${
                          isViewing ? 'bg-primary-500/[0.05]' : ''
                        }`}
                      >
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-ink dark:text-primary-50">
                            {MONTHS[record.billingMonth - 1]} {record.billingYear}
                          </div>
                          {isViewing && (
                            <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/15 text-primary-700 dark:text-primary-200">
                              Selected
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 font-mono">{formatCurrency(record.originalFee)}</td>
                        <td className="px-3.5 py-3 font-mono text-red-500">
                          {record.scholarshipAmount > 0 ? formatCurrency(record.scholarshipAmount) : '—'}
                        </td>
                        <td className="px-3.5 py-3 font-mono font-medium text-primary-600 dark:text-primary-300">{formatCurrency(record.amount)}</td>
                        <td className="px-3.5 py-3 font-mono font-medium">{formatCurrency(record.paidAmount)}</td>
                        <td className="px-3.5 py-3 font-mono font-medium text-red-600 dark:text-red-300">{formatCurrency(due)}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <FeeStatusBadge status={
                            record.status === 'Skipped' ? 'Skipped' :
                            record.amount - record.paidAmount === 0 && record.amount > 0 ? 'Paid' :
                            record.amount === 0 && record.paidAmount === 0 ? 'Paid' :
                            record.status === 'Partially Paid' ? 'Partial' :
                            record.status === 'Paid' ? 'Paid' : 'Due'
                          } />
                        </td>
                        <td className="px-3.5 py-3 text-xs text-ink/65 dark:text-primary-100/65 whitespace-nowrap">
                          {record.paymentDate ? (
                            <div>
                              <p className="font-medium text-ink/80 dark:text-primary-50">{record.paymentDate}</p>
                              <p className="text-[11px] text-ink/45 dark:text-primary-100/45">{record.paymentMethod || 'Cash'}{record.remark ? ` (${record.remark})` : ''}</p>
                            </div>
                          ) : (
                            <span className="text-ink/35 dark:text-primary-100/35">—</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-primary-600 dark:text-primary-300 hover:text-primary-700 hover:bg-primary-500/10"
                            onClick={() => {
                              setSelectedMonth(record.billingMonth)
                              setSelectedYear(record.billingYear)
                              setFeeHistoryOpen(false)
                            }}
                          >
                            View Month
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete {student.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the student's record and fee history. This action cannot be undone.
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-3">
            <AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel>
            <AlertDialogAction asChild><Button variant="danger" onClick={handleDelete}>Delete</Button></AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
