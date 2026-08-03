import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, IndianRupee, Users, Download, AlertTriangle } from 'lucide-react'
import { exportToCsv } from '@/lib/export'
import { SearchBar } from '@/components/SearchBar'
import { FeeStatusBadge } from '@/components/StatusBadge'
import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import type { FeeRecord } from '@/types'
import { toast } from 'sonner'
import { db } from '@/lib/db'

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
]

export function JanabFees() {
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [active, setActive] = useState<FeeRecord | null>(null)
  
  const [originalFee, setOriginalFee] = useState(0)
  const [scholarship, setScholarship] = useState(0)
  const [isSkipped, setIsSkipped] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  const loadData = async (month: number, year: number) => {
    setLoading(true)
    try {
      const data = await db.getAccountsDataByMonth(month, year)
      setRecords(data)
    } catch (err) {
      toast.error('Failed to load fee data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter(
      (r) => r.studentName.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q) || r.studentIts.includes(q)
    )
  }, [records, query])

  const stats = useMemo(() => {
    let totalOriginal = 0
    let totalScholarship = 0
    let totalPayable = 0
    
    for (const r of records) {
      if (r.status !== 'Skipped') {
        totalOriginal += r.originalFee
        totalScholarship += r.scholarshipAmount
        totalPayable += r.amount
      }
    }

    return { 
      totalOriginal, 
      totalScholarship, 
      totalPayable,
      totalStudents: records.length
    }
  }, [records])

  const openEditDialog = (record: FeeRecord) => {
    setActive(record)
    setOriginalFee(record.originalFee)
    setScholarship(record.scholarshipAmount)
    setIsSkipped(record.status === 'Skipped')
  }

  const calculatedPayable = isSkipped ? 0 : Math.max(0, originalFee - scholarship)

  async function handleSave() {
    if (!active) return

    if (scholarship < 0 || scholarship > originalFee) {
      toast.error('Scholarship cannot be less than 0 or greater than original fee.')
      return
    }

    if (!isSkipped && calculatedPayable < active.paidAmount) {
      toast.error(`Payable amount (${formatCurrency(calculatedPayable)}) cannot be less than the amount already paid (${formatCurrency(active.paidAmount)}).`)
      return
    }

    setSubmitting(true)
    try {
      await db.updateMonthlyFeeDetails(active.id, originalFee, scholarship, isSkipped)
      toast.success('Fee record updated successfully')
      setActive(null)
      await loadData(selectedMonth, selectedYear)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update fee record')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerateFees() {
    setGenerating(true)
    try {
      const count = await db.generateMonthlyFees(selectedMonth, selectedYear)
      if (count > 0) {
        toast.success(`${count} fee records generated for ${MONTHS[selectedMonth-1]} ${selectedYear}.`)
        await loadData(selectedMonth, selectedYear)
      } else {
        toast.info(`Fees for ${MONTHS[selectedMonth-1]} ${selectedYear} are already generated.`)
      }
    } catch (error) {
      toast.error('Failed to generate monthly fees')
    } finally {
      setGenerating(false)
    }
  }

  function handleExport() {
    const data = filtered.map(r => ({
      'Student Name': r.studentName,
      'ITS': r.studentIts,
      'Billing Month': `${MONTHS[r.billingMonth - 1]} ${r.billingYear}`,
      'Original Fee': r.originalFee,
      'Scholarship': r.scholarshipAmount,
      'Payable (Amount)': r.amount,
      'Paid': r.paidAmount,
      'Due': Math.max(0, r.amount - r.paidAmount),
      'Status': r.status
    }))
    exportToCsv(`janab_fees_${MONTHS[selectedMonth-1]}_${selectedYear}.csv`, data)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink dark:text-primary-50">Fee Management</h2>
          <p className="text-sm text-ink/50 dark:text-primary-100/50">Manage scholarships and monthly waivers</p>
        </div>
        <div className="flex gap-3 items-center">
          <select 
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select 
            className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Original Fees" value={stats.totalOriginal} prefix="₹" icon={Wallet} tone="neutral" index={0} />
        <StatsCard label="Total Scholarships" value={stats.totalScholarship} prefix="₹" icon={IndianRupee} tone="destructive" index={1} />
        <StatsCard label="Total Payable Expected" value={stats.totalPayable} prefix="₹" icon={Wallet} tone="brass" index={2} />
        <StatsCard label="Number of Students" value={stats.totalStudents} icon={Users} tone="primary" index={3} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-ink/60 font-medium">
          Showing {MONTHS[selectedMonth-1]} {selectedYear}
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" size="sm" onClick={handleGenerateFees} disabled={generating} className="h-10">
            {generating ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {generating ? 'Generating...' : 'Generate Monthly Fees'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <SearchBar value={query} onChange={setQuery} className="sm:w-72" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center gap-2 p-16 text-center">
          <Users className="h-9 w-9 text-ink/25" />
          <p className="font-medium text-ink/60 dark:text-primary-100/60">No matching records for {MONTHS[selectedMonth-1]} {selectedYear}</p>
        </div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-primary-900/10 text-left text-xs uppercase tracking-wide text-ink/45 dark:border-primary-100/10 dark:text-primary-100/45">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Original Fee</th>
                <th className="px-4 py-3 font-semibold text-red-500">Scholarship</th>
                <th className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-300">Payable</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-primary-900/[0.05] last:border-0 hover:bg-primary-900/[0.02] dark:border-primary-100/[0.06] dark:hover:bg-primary-100/[0.03] ${record.status === 'Skipped' ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink dark:text-primary-50">{record.studentName}</div>
                    <div className="text-xs text-ink/60 dark:text-primary-100/60 font-mono mt-0.5">{record.studentIts}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(record.originalFee)}</td>
                  <td className="px-4 py-3 font-mono text-red-500">{formatCurrency(record.scholarshipAmount)}</td>
                  <td className="px-4 py-3 font-mono text-primary-600 dark:text-primary-300">{formatCurrency(record.amount)}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(record.paidAmount)}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(Math.max(0, record.amount - record.paidAmount))}</td>
                  <td className="px-4 py-3">
                    <FeeStatusBadge status={
                      record.status === 'Skipped' ? 'Skipped' :
                      record.amount - record.paidAmount === 0 && record.amount > 0 ? 'Paid' :
                      record.amount === 0 && record.paidAmount === 0 ? 'Paid' :
                      record.status === 'Partially Paid' ? 'Partial' : 
                      record.status === 'Paid' ? 'Paid' : 'Due'
                    } />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(record)}>
                      Edit Fee
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(open) => {
        if (!submitting && !open) setActive(null)
      }}>
        <DialogContent>
          <DialogTitle>Edit Fee Details</DialogTitle>
          <DialogDescription>
            {active?.studentName} • {MONTHS[selectedMonth-1]} {selectedYear}
          </DialogDescription>

          {active && (
            <div className="mt-5 space-y-5">
              
              {active.paidAmount > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-red-500/[0.08] p-3 text-red-700 dark:text-red-300/90 text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>
                    <strong>Warning:</strong> Payments (₹{active.paidAmount}) have already been recorded for this month. 
                    You cannot reduce the payable amount below the paid amount. No automatic credits or refunds are generated.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl border border-primary-900/10 dark:border-primary-100/10 bg-primary-900/[0.02] dark:bg-primary-100/[0.02]">
                <Label htmlFor="skip-fee" className="font-semibold cursor-pointer">Skip Fee For This Month</Label>
                <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <input
                    id="skip-fee"
                    type="checkbox"
                    checked={isSkipped}
                    onChange={(e) => setIsSkipped(e.target.checked)}
                    className="peer sr-only"
                    disabled={submitting}
                  />
                  <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-input transition-colors peer-checked:bg-primary-600"></span>
                  <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-primary-200 bg-white shadow transition-transform peer-checked:translate-x-4"></span>
                </div>
              </div>

              {!isSkipped && (
                <>
                  <div>
                    <Label>Original Fee (₹)</Label>
                    <Input
                      type="number"
                      value={originalFee}
                      onChange={(e) => setOriginalFee(Number(e.target.value))}
                      min={0}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label>Scholarship Amount (₹)</Label>
                    <Input
                      type="number"
                      value={scholarship}
                      onChange={(e) => setScholarship(Number(e.target.value))}
                      min={0}
                      max={originalFee}
                      disabled={submitting}
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

              <Button className="w-full relative" variant="brass" onClick={handleSave} disabled={submitting}>
                {submitting ? (
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
    </div>
  )
}
