import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, IndianRupee, Users, CheckCircle2, Download } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { exportToCsv } from '@/lib/export'
import { SearchBar } from '@/components/SearchBar'
import { FeeStatusBadge } from '@/components/StatusBadge'
import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import type { Student } from '@/types'
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable'
import { toast } from 'sonner'

export function AccountsOverview() {
  const { students, loading, recordPayment, monthlyFee } = useData()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Student | null>(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.its.includes(q),
    )
  }, [students, query])

  const stats = useMemo(() => {
    const collected = students.reduce((sum, s) => sum + s.paidAmount, 0)
    const pending = students.reduce((sum, s) => sum + s.dueAmount, 0)
    const fullyPaid = students.filter((s) => s.feeStatus === 'Paid').length
    return { collected, pending, fullyPaid }
  }, [students])

  async function handleUpdate() {
    if (!active) return
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error('Enter a valid amount greater than 0')
      return
    }
    if (value > active.dueAmount) {
      toast.error(`Amount cannot exceed the due balance of ${formatCurrency(active.dueAmount)}`)
      return
    }
    setSubmitting(true)
    try {
      await recordPayment(active.id, value, `Cash payment received`)
      toast.success(`₹${value} recorded for ${active.name}`)
      const refreshed = students.find((s) => s.id === active.id)
      setActive(refreshed ? { ...refreshed, paidAmount: refreshed.paidAmount + value } : null)
      setAmount('')
    } finally {
      setSubmitting(false)
    }
  }

  function handleExport() {
    const data = filtered.map(s => ({
      Name: s.name,
      ITS: s.its,
      'Monthly Fee': s.monthlyFee,
      'Total Paid': s.paidAmount,
      'Total Due': s.dueAmount,
      'Fee Status': s.feeStatus
    }))
    exportToCsv('accounts_students.csv', data)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatsCard label="Collected Fees" value={stats.collected} prefix="₹" icon={Wallet} tone="brass" index={0} />
        <StatsCard label="Pending Fees" value={stats.pending} prefix="₹" icon={IndianRupee} tone="neutral" index={1} />
        <StatsCard label="Fully Paid Students" value={stats.fullyPaid} icon={CheckCircle2} tone="primary" index={2} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink dark:text-primary-50">Fee Collection</h2>
          <p className="text-sm text-ink/50 dark:text-primary-100/50">Manage student fees and records</p>
        </div>
        <div className="flex gap-3 items-center">
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
          <p className="font-medium text-ink/60 dark:text-primary-100/60">No matching students</p>
        </div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-primary-900/10 text-left text-xs uppercase tracking-wide text-ink/45 dark:border-primary-100/10 dark:text-primary-100/45">
                <th className="px-4 py-3 font-semibold">Student ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">ITS</th>
                <th className="px-4 py-3 font-semibold">Monthly Fee</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-primary-900/[0.05] last:border-0 hover:bg-primary-900/[0.02] dark:border-primary-100/[0.06] dark:hover:bg-primary-100/[0.03]"
                >
                  <td className="px-4 py-3 font-mono text-ink/70 dark:text-primary-100/70">{student.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink dark:text-primary-50">{student.name}</td>
                  <td className="px-4 py-3 font-mono text-ink/70 dark:text-primary-100/70">{student.its}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(student.monthlyFee)}</td>
                  <td className="px-4 py-3 font-mono text-primary-600 dark:text-primary-300">{formatCurrency(student.paidAmount)}</td>
                  <td className="px-4 py-3 font-mono text-red-500">{formatCurrency(student.dueAmount)}</td>
                  <td className="px-4 py-3"><FeeStatusBadge status={student.feeStatus} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={student.feeStatus === 'Paid' ? 'outline' : 'brass'}
                      disabled={student.feeStatus === 'Paid'}
                      onClick={() => { setActive(student); setAmount('') }}
                    >
                      {student.feeStatus === 'Paid' ? 'Settled' : 'Update Fee'}
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          <DialogTitle>Update Fee — {active?.name}</DialogTitle>
          <DialogDescription>
            Monthly fee {formatCurrency(monthlyFee)} · Currently due {active && formatCurrency(active.dueAmount)}
          </DialogDescription>

          {active && (
            <div className="mt-5 space-y-5">
              <div>
                <Label>Amount Received (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Up to ${active.dueAmount}`}
                  max={active.dueAmount}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-500/[0.08] p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-primary-700 dark:text-primary-200/70">New Paid</p>
                  <p className="mt-1 font-mono text-lg font-bold text-primary-700 dark:text-primary-200">
                    {formatCurrency(Math.min(monthlyFee, active.paidAmount + (Number(amount) || 0)))}
                  </p>
                </div>
                <div className="rounded-xl bg-red-500/[0.07] p-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-red-600/80 dark:text-red-300/70">New Due</p>
                  <p className="mt-1 font-mono text-lg font-bold text-red-600 dark:text-red-300">
                    {formatCurrency(Math.max(0, monthlyFee - active.paidAmount - (Number(amount) || 0)))}
                  </p>
                </div>
              </div>

              <Button className="w-full" variant="brass" onClick={handleUpdate} disabled={submitting}>
                {submitting ? 'Updating...' : 'Update'}
              </Button>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Payment History</p>
                <PaymentHistoryTable history={active.paymentHistory} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
