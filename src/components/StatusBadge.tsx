import { cn } from '@/lib/utils'
import type { FeeStatus } from '@/types'

const feeStyles: Record<FeeStatus, string> = {
  Paid: 'bg-primary-500/10 text-primary-600 dark:text-primary-200 ring-1 ring-primary-500/25',
  Partial: 'bg-brass-500/10 text-brass-700 dark:text-brass-300 ring-1 ring-brass-500/25',
  Due: 'bg-red-500/10 text-red-600 dark:text-red-300 ring-1 ring-red-500/25',
  Skipped: 'bg-ink/5 text-ink/50 dark:bg-primary-100/10 dark:text-primary-100/50 ring-1 ring-ink/10',
}

const marhalaStyles: Record<'Completed' | 'Pending' | 'Not Started', string> = {
  Completed: 'bg-primary-500/10 text-primary-600 dark:text-primary-200 ring-1 ring-primary-500/25',
  Pending: 'bg-brass-500/10 text-brass-700 dark:text-brass-300 ring-1 ring-brass-500/25',
  'Not Started': 'bg-ink/5 text-ink/50 dark:bg-primary-100/10 dark:text-primary-100/50 ring-1 ring-ink/10',
}

export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', feeStyles[status])}>
      {status}
    </span>
  )
}

export function MarhalaBadge({ status }: { status: { text: string; type: 'Not Started' | 'Pending' | 'Completed' } }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', marhalaStyles[status.type])}>
      {status.text}
    </span>
  )
}
