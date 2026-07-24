import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Student } from '@/types'
import { FeeStatusBadge, MarhalaBadge } from './StatusBadge'
import { getMarhalaStatus } from '@/lib/quran'
import { formatCurrency, initials } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'

export function StudentCard({ student, index = 0 }: { student: Student; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="card-surface group p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 font-display text-sm font-bold text-white">
            {initials(student.name)}
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-primary-50">{student.name}</p>
            <p className="font-mono text-xs text-ink/45 dark:text-primary-100/45">{student.id}</p>
          </div>
        </div>
        <Link
          to={`/janab/students/${student.id}`}
          className="rounded-lg p-1.5 text-ink/40 opacity-0 transition-opacity hover:bg-primary-900/5 group-hover:opacity-100 dark:text-primary-100/40"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <MarhalaBadge status={getMarhalaStatus(student.completedJuz || [])} />
        <FeeStatusBadge status={student.feeStatus} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink/50 dark:text-primary-100/50">Due</span>
        <span className="font-mono font-semibold text-ink dark:text-primary-50">{formatCurrency(student.dueAmount)}</span>
      </div>
    </motion.div>
  )
}
