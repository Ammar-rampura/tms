import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, IndianRupee, Users, CheckCircle2, Download } from 'lucide-react'
import { exportToCsv } from '@/lib/export'
import { SearchBar } from '@/components/SearchBar'
import { FeeStatusBadge } from '@/components/StatusBadge'
import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import type { FeeRecord, PaymentResult } from '@/types'
import { toast } from 'sonner'
import { db } from '@/lib/db'

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
]

export function AccountsOverview() {
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [active, setActive] = useState<FeeRecord | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  const loadData = async (month: number, year: number) => {
    setLoading(true)
    try {
      const data = await db.getAccountsDataByMonth(month, year)
      setRecords(data)
    } catch (err) {
      toast.error('Failed to load accounts data')
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
    let currentMonthFees = 0
    let collected = 0
    let outstandingBalance = 0
    let fullyPaid = 0

    for (const r of records) {
      currentMonthFees += r.amount
      collected += r.paidAmount
      outstandingBalance += r.outstandingBalance
      if (r.status === 'Paid') fullyPaid++
    }

    const totalPayable = currentMonthFees + outstandingBalance

    return { 
      currentMonthFees, 
      collected, 
      outstandingBalance,
      totalPayable,
      fullyPaid,
      totalStudents: records.length
    }
  }, [records])

  async function handleUpdate() {
    if (!active) return
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error('Enter a valid amount greater than 0')
      return
    }

    const totalDue = Math.max(0, active.amount - active.paidAmount) + active.outstandingBalance
    
    if (value > totalDue) {
      toast.error(`Amount cannot exceed the total payable of ${formatCurrency(totalDue)}`)
      return
    }

    setSubmitting(true)
    try {
      const result: PaymentResult = await db.processPayment(active.studentId, value, paymentMethod)
      
      let summary = `Payment Successful!\n₹${result.paymentApplied} received.\n\nApplied to:\n`
      result.updatedRecords.forEach(ur => {
        summary += `✓ ${ur.monthLabel} — ${ur.status}\n`
      })
      summary += `\nRemaining Outstanding: ₹${result.remainingAmount}`
      
      toast.success(summary, { duration: 8000 })
      setActive(null)
      setAmount('')
      
      await loadData(selectedMonth, selectedYear)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment processing failed')
      await loadData(selectedMonth, selectedYear)
    } finally {
      setSubmitting(false)
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
      'Outstanding Balance': r.outstandingBalance,
      'Total Payable': Math.max(0, r.amount - r.paidAmount) + r.outstandingBalance,
      'Status': r.status
    }))
    exportToCsv(`accounts_fees_${MONTHS[selectedMonth-1]}_${selectedYear}.csv`, data)
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
    } catch (err) {
      console.error('Error generating fees:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to generate monthly fees')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink dark:text-primary-50">Accounts Dashboard</h2>
          <p className="text-sm text-ink/50 dark:text-primary-100/50">Manage monthly fees and balances</p>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Current Month Fees" value={stats.currentMonthFees} prefix="₹" icon={Wallet} tone="neutral" index={0} />
        <StatsCard label="Collected" value={stats.collected} prefix="₹" icon={CheckCircle2} tone="primary" index={1} />
        <StatsCard label="Outstanding Balance" value={stats.outstandingBalance} prefix="₹" icon={IndianRupee} tone="destructive" index={2} />
        <StatsCard label="Total Payable" value={stats.totalPayable} prefix="₹" icon={Wallet} tone="brass" index={3} />
        <StatsCard label="Number of Students" value={stats.totalStudents} icon={Users} tone="neutral" index={4} />
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
                <th className="px-4 py-3 font-semibold">Student ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Original Fee</th>
                <th className="px-4 py-3 font-semibold">Scholarship</th>
                <th className="px-4 py-3 font-semibold">Payable</th>
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
                  className="border-b border-primary-900/[0.05] last:border-0 hover:bg-primary-900/[0.02] dark:border-primary-100/[0.06] dark:hover:bg-primary-100/[0.03]"
                >
                  <td className="px-4 py-3 font-mono text-ink/70 dark:text-primary-100/70">{record.studentId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink dark:text-primary-50">{record.studentName}</div>
                    <div className="text-xs text-ink/60 font-mono mt-0.5">{record.studentIts}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink/70">{formatCurrency(record.originalFee)}</td>
                  <td className="px-4 py-3 font-mono text-red-500">{record.scholarshipAmount > 0 ? formatCurrency(record.scholarshipAmount) : '-'}</td>
                  <td className="px-4 py-3 font-mono text-primary-600 dark:text-primary-300">{formatCurrency(record.amount)}</td>
                  <td className="px-4 py-3 font-mono text-ink">{formatCurrency(record.paidAmount)}</td>
                  <td className="px-4 py-3 font-mono text-red-500">
                    {formatCurrency(Math.max(0, record.amount - record.paidAmount) + record.outstandingBalance)}
                  </td>
                  <td className="px-4 py-3">
                    <FeeStatusBadge status={
                      record.status === 'Skipped' ? 'Skipped' :
                      Math.max(0, record.amount - record.paidAmount) + record.outstandingBalance === 0 ? 'Paid' :
                      record.outstandingBalance > 0 ? 'Due' :
                      record.status === 'Partially Paid' ? 'Partial' : 
                      record.status === 'Paid' ? 'Paid' : 'Due'
                    } />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={record.status === 'Skipped' || Math.max(0, record.amount - record.paidAmount) + record.outstandingBalance === 0 ? 'outline' : 'brass'}
                      disabled={record.status === 'Skipped' || Math.max(0, record.amount - record.paidAmount) + record.outstandingBalance === 0}
                      onClick={() => { setActive(record); setAmount('') }}
                    >
                      {record.status === 'Skipped' ? 'Skipped' : Math.max(0, record.amount - record.paidAmount) + record.outstandingBalance === 0 ? 'Settled' : 'Update Fee'}
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
          <DialogTitle>Receive Payment</DialogTitle>
          <DialogDescription>
            {active?.studentName} • {active?.studentIts}
          </DialogDescription>

          {active && (
            <div className="mt-5 space-y-5">
              
              <div className="bg-primary-900/[0.02] dark:bg-primary-100/[0.02] p-4 rounded-xl border border-primary-900/10 dark:border-primary-100/10">
                {active.outstandingRecords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 mb-2">Outstanding Months</p>
                    <div className="space-y-1">
                      {active.outstandingRecords.map(hr => (
                        <div key={hr.id} className="flex justify-between text-sm">
                          <span>{MONTHS[hr.billingMonth - 1]} {hr.billingYear}</span>
                          <span className="font-mono text-red-500">{formatCurrency(Math.max(0, hr.amount - hr.paidAmount))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 pb-4 border-b border-primary-900/10 dark:border-primary-100/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 mb-2">Current Month</p>
                  <div className="flex justify-between text-sm">
                    <span>{MONTHS[active.billingMonth - 1]} {active.billingYear}</span>
                    <span className="font-mono">{formatCurrency(Math.max(0, active.amount - active.paidAmount))}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Payable</span>
                  <span className="font-mono text-ink dark:text-primary-50">
                    {formatCurrency(Math.max(0, active.amount - active.paidAmount) + active.outstandingBalance)}
                  </span>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <select 
                  className="w-full mt-1.5 rounded-xl border border-primary-900/12 dark:border-primary-100/12 bg-white/70 dark:bg-primary-900/40 p-3.5 text-sm"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={submitting}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <Label>Amount Received (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Up to ${Math.max(0, active.amount - active.paidAmount) + active.outstandingBalance}`}
                  max={Math.max(0, active.amount - active.paidAmount) + active.outstandingBalance}
                  disabled={submitting}
                />
              </div>

              <Button className="w-full relative" variant="brass" onClick={handleUpdate} disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </span>
                ) : 'Record Payment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
