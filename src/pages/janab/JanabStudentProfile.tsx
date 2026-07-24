import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { ProfileCard } from '@/components/ProfileCard'
import { FeeCard } from '@/components/FeeCard'
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/Skeleton'
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { MARAHIL } from '@/lib/quran'
import type { Program } from '@/types'
import { toast } from 'sonner'

export function JanabStudentProfile() {
  const { id } = useParams<{ id: string }>()
  const { students, loading, updateStudent, deleteStudent } = useData()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    name: '', age: 0, mobile: '', fatherName: '', fatherIts: '', motherName: '', motherIts: '', parentNumber: '', email: '', address: '', program: 'Tahfeez' as Program, completedJuz: [] as number[], remarks: '',
  })

  const student = students.find((s) => s.id === id)

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        age: student.age,
        mobile: student.mobile,
        fatherName: student.fatherName,
        fatherIts: student.fatherIts,
        motherName: student.motherName,
        motherIts: student.motherIts,
        parentNumber: student.parentNumber,
        email: student.email,
        address: student.address,
        program: student.program,
        completedJuz: student.completedJuz || [],
        remarks: student.remarks ?? '',
      })
    }
  }, [student?.id])

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
    await updateStudent(student!.id, { ...form, age: Number(form.age) })
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ProfileCard student={student} />
        <FeeCard student={student} />
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
            <Label>Parent Number</Label>
            <Input value={form.parentNumber} onChange={(e) => setForm({ ...form, parentNumber: e.target.value })} />
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
        <PaymentHistoryTable history={student.paymentHistory} />
      </div>

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
