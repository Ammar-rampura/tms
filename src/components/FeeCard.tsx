import { formatCurrency } from '@/lib/utils'
import { FeeStatusBadge } from './StatusBadge'
import type { Student } from '@/types'
import { Wallet } from 'lucide-react'

export function FeeCard({ student }: { student: Student }) {
  const progress = Math.min(100, Math.round((student.paidAmount / student.monthlyFee) * 100))
  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-500/15 text-brass-600 dark:text-brass-300">
            <Wallet className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base font-semibold">Fee Overview</h3>
        </div>
        <FeeStatusBadge status={student.feeStatus} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-primary-900/[0.03] dark:bg-primary-100/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Monthly Fee</p>
          <p className="mt-1 font-mono text-lg font-bold text-ink dark:text-primary-50">{formatCurrency(student.monthlyFee)}</p>
        </div>
        <div className="rounded-xl bg-primary-500/[0.08] p-3">
          <p className="text-[11px] uppercase tracking-wide text-primary-700 dark:text-primary-200/70">Paid</p>
          <p className="mt-1 font-mono text-lg font-bold text-primary-700 dark:text-primary-200">{formatCurrency(student.paidAmount)}</p>
        </div>
        <div className="rounded-xl bg-red-500/[0.07] p-3">
          <p className="text-[11px] uppercase tracking-wide text-red-600/80 dark:text-red-300/70">Due</p>
          <p className="mt-1 font-mono text-lg font-bold text-red-600 dark:text-red-300">{formatCurrency(student.dueAmount)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-ink/45 dark:text-primary-100/45">{progress}% of monthly fee cleared</p>
      </div>
    </div>
  )
}
