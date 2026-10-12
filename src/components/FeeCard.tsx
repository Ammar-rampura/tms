import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { FeeStatusBadge } from './StatusBadge'
import type { Student, FeeRecord, FeeStatus } from '@/types'
import { Wallet, Edit3, History } from 'lucide-react'
import { Button } from './ui/button'

export interface FeeCardProps {
  student: Student
  feeRecord?: FeeRecord | null
  monthLabel?: string
  onEditFee?: (feeRecord: FeeRecord) => void
  onViewHistory?: () => void
  monthSelector?: React.ReactNode
}

export function FeeCard({ student, feeRecord, monthLabel, onEditFee, onViewHistory, monthSelector }: FeeCardProps) {
  // Use feeRecord data if available; fallback to student fields
  const hasFeeRecord = !!feeRecord
  const originalFee = hasFeeRecord ? feeRecord.originalFee : student.monthlyFee
  const scholarship = hasFeeRecord ? feeRecord.scholarshipAmount : 0
  const payable = hasFeeRecord ? feeRecord.amount : student.monthlyFee
  const paid = hasFeeRecord ? feeRecord.paidAmount : student.paidAmount
  const due = hasFeeRecord ? Math.max(0, feeRecord.amount - feeRecord.paidAmount) : student.dueAmount

  const status: FeeStatus = hasFeeRecord
    ? (
        feeRecord.status === 'Skipped' ? 'Skipped' :
        feeRecord.amount - feeRecord.paidAmount === 0 && feeRecord.amount > 0 ? 'Paid' :
        feeRecord.amount === 0 && feeRecord.paidAmount === 0 ? 'Paid' :
        feeRecord.status === 'Partially Paid' ? 'Partial' :
        feeRecord.status === 'Paid' ? 'Paid' : 'Due'
      )
    : student.feeStatus

  const totalToClear = payable > 0 ? payable : (originalFee > 0 ? originalFee : 1)
  const progress = status === 'Skipped' 
    ? 100 
    : Math.min(100, Math.round((paid / totalToClear) * 100))

  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-500/15 text-brass-600 dark:text-brass-300">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-ink dark:text-primary-50">Fee Overview</h3>
            {monthLabel && (
              <p className="text-[11px] font-medium text-ink/45 dark:text-primary-100/45">{monthLabel}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {monthSelector}
          <FeeStatusBadge status={status} />
          {onViewHistory && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs text-brass-700 dark:text-brass-300 border-brass-500/30 hover:bg-brass-500/10"
              onClick={onViewHistory}
              title="View all previous months billing and payment records"
            >
              <History className="mr-1 h-3 w-3" /> Fee History
            </Button>
          )}
          {onEditFee && feeRecord && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs text-ink/70 hover:text-ink dark:text-primary-100/70 dark:hover:text-primary-50"
              onClick={() => onEditFee(feeRecord)}
            >
              <Edit3 className="mr-1 h-3 w-3" /> Edit Fee
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-primary-900/[0.03] dark:bg-primary-100/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">
            {scholarship > 0 ? 'Payable Fee' : 'Monthly Fee'}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-ink dark:text-primary-50">{formatCurrency(payable)}</p>
          {scholarship > 0 && (
            <p className="mt-0.5 font-mono text-[10px] text-red-500 line-through">{formatCurrency(originalFee)}</p>
          )}
        </div>
        <div className="rounded-xl bg-primary-500/[0.08] p-3">
          <p className="text-[11px] uppercase tracking-wide text-primary-700 dark:text-primary-200/70">Paid</p>
          <p className="mt-1 font-mono text-lg font-bold text-primary-700 dark:text-primary-200">{formatCurrency(paid)}</p>
        </div>
        <div className="rounded-xl bg-red-500/[0.07] p-3">
          <p className="text-[11px] uppercase tracking-wide text-red-600/80 dark:text-red-300/70">Due</p>
          <p className="mt-1 font-mono text-lg font-bold text-red-600 dark:text-red-300">{formatCurrency(due)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink/45 dark:text-primary-100/45">
          {scholarship > 0 ? (
            <span className="text-red-500 font-medium">Scholarship: {formatCurrency(scholarship)}</span>
          ) : (
            <span />
          )}
          <span>{progress}% of monthly fee cleared</span>
        </div>
      </div>

      {feeRecord && feeRecord.outstandingBalance > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-600 dark:text-red-300">
          <span>Prior Unpaid Months Balance</span>
          <span className="font-mono font-bold">+{formatCurrency(feeRecord.outstandingBalance)}</span>
        </div>
      )}
    </div>
  )
}

