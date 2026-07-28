import type { Student } from '@/types'
import { MarhalaBadge } from './StatusBadge'
import { getMarhalaStatus } from '@/lib/quran'
import { initials, formatDate } from '@/lib/utils'
import { Phone, MapPin, User, Hash, Calendar } from 'lucide-react'

export function ProfileCard({ student }: { student: Student }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="relative h-20 bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700">
        <div className="arch-motif absolute inset-0 text-white/10" />
      </div>
      <div className="relative z-10 px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-panel dark:border-primary-800 bg-gradient-to-br from-brass-400 to-brass-500 font-display text-xl font-bold text-primary-900 shadow-soft">
            {initials(student.name)}
          </div>
          <MarhalaBadge status={getMarhalaStatus(student.completedJuz)} />
        </div>

        <h2 className="mt-3 font-display text-lg font-semibold text-ink dark:text-primary-50 flex items-center gap-2">
          {student.name}
          {student.status === 'inactive' && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Inactive
            </span>
          )}
        </h2>
        <p className="font-mono text-xs text-ink/45 dark:text-primary-100/45">{student.id}</p>

        <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-ink/70 dark:text-primary-100/70">
            <Hash className="h-3.5 w-3.5 text-ink/35 dark:text-primary-100/35" /> ITS: {student.its}
          </div>
          <div className="flex items-center gap-2 text-ink/70 dark:text-primary-100/70">
            <User className="h-3.5 w-3.5 text-ink/35 dark:text-primary-100/35" /> Age: {student.age}
          </div>
          <div className="flex items-center gap-2 text-ink/70 dark:text-primary-100/70">
            <Phone className="h-3.5 w-3.5 text-ink/35 dark:text-primary-100/35" /> {student.mobile}
          </div>
          <div className="flex items-center gap-2 text-ink/70 dark:text-primary-100/70">
            <Calendar className="h-3.5 w-3.5 text-ink/35 dark:text-primary-100/35" /> Joined {formatDate(student.createdDate)}
          </div>
          <div className="col-span-full flex items-start gap-2 text-ink/70 dark:text-primary-100/70">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/35 dark:text-primary-100/35" /> {student.address}
          </div>
        </div>

        {student.remarks && (
          <div className="mt-4 rounded-xl bg-brass-500/[0.08] p-3 text-sm text-ink/65 dark:text-primary-100/65">
            <span className="font-semibold text-brass-700 dark:text-brass-300">Remarks: </span>
            {student.remarks}
          </div>
        )}
      </div>
    </div>
  )
}
