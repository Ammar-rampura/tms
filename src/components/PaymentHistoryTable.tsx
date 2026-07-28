import { formatCurrency, formatDate } from '@/lib/utils'
import type { PaymentRecord } from '@/types'
import { Receipt } from 'lucide-react'

export function PaymentHistoryTable({ history }: { history: PaymentRecord[] }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-900/15 dark:border-primary-100/15 py-10 text-center">
        <Receipt className="mb-2 h-8 w-8 text-ink/25 dark:text-primary-100/25" />
        <p className="text-sm font-medium text-ink/60 dark:text-primary-100/60">No payments recorded yet</p>
        <p className="text-xs text-ink/40 dark:text-primary-100/40">Payments made at the office will appear here.</p>
      </div>
    )
  }

  const total = history.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-primary-900/10 dark:border-primary-100/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary-900/10 bg-primary-900/[0.03] text-left text-xs uppercase tracking-wide text-ink/50 dark:border-primary-100/10 dark:bg-primary-100/[0.04] dark:text-primary-100/50">
            <th className="px-4 py-2.5 font-semibold">Date</th>
            <th className="px-4 py-2.5 font-semibold">Note</th>
            <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {history
            .slice()
            .reverse()
            .map((record) => (
              <tr key={record.id} className="border-b border-primary-900/[0.05] last:border-0 dark:border-primary-100/[0.06]">
                <td className="px-4 py-2.5 text-ink/70 dark:text-primary-100/70">{formatDate(record.date)}</td>
                <td className="px-4 py-2.5 text-ink/55 dark:text-primary-100/55">{record.note ?? 'Cash payment'}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-primary-600 dark:text-primary-200">
                  +{formatCurrency(record.amount)}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr className="bg-primary-900/[0.03] dark:bg-primary-100/[0.04]">
            <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-primary-100/50">
              Total Collected
            </td>
            <td className="px-4 py-2.5 text-right font-mono font-bold text-ink dark:text-primary-50">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
