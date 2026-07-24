import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Wallet, AlertCircle, UserPlus, BarChart3 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { StatsCard } from '@/components/StatsCard'
import { StudentCard } from '@/components/StudentCard'
import { Skeleton } from '@/components/Skeleton'
import { Link } from 'react-router-dom'

export function JanabOverview() {
  const { students, loading } = useData()

  const stats = useMemo(() => {
    const collected = students.reduce((sum, s) => sum + s.paidAmount, 0)
    const pending = students.reduce((sum, s) => sum + s.dueAmount, 0)
    const today = new Date().toDateString()
    const todayRegs = students.filter((s) => new Date(s.createdDate).toDateString() === today).length
    return { total: students.length, collected, pending, todayRegs }
  }, [students])

  const recent = students.slice(0, 4)

  const hifzBreakdown = useMemo(() => {
    const counts = { Completed: 0, Ongoing: 0, 'Not Started': 0 }
    students.forEach((s) => (counts[s.hifzStatus] += 1))
    return counts
  }, [students])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Students" value={stats.total} icon={Users} tone="primary" index={0} />
        <StatsCard label="Collected Fees" value={stats.collected} prefix="₹" icon={Wallet} tone="brass" index={1} />
        <StatsCard label="Pending Fees" value={stats.pending} prefix="₹" icon={AlertCircle} tone="neutral" index={2} />
        <StatsCard label="Today's Registrations" value={stats.todayRegs} icon={UserPlus} tone="primary" index={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-surface p-5 xl:col-span-2"
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            <h3 className="font-display text-base font-semibold text-ink dark:text-primary-50">Hifz Progress Breakdown</h3>
          </div>
          <div className="space-y-3">
            {(['Completed', 'Ongoing', 'Not Started'] as const).map((key) => {
              const value = hifzBreakdown[key]
              const pct = stats.total ? Math.round((value / stats.total) * 100) : 0
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ink/60 dark:text-primary-100/60">{key}</span>
                    <span className="font-mono font-semibold text-ink dark:text-primary-50">{value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-surface flex flex-col justify-between p-5"
        >
          <div>
            <h3 className="font-display text-base font-semibold text-ink dark:text-primary-50">Collection Rate</h3>
            <p className="mt-1 text-sm text-ink/50 dark:text-primary-100/50">Of total expected monthly fee</p>
          </div>
          <div className="my-4 flex items-end gap-2">
            <span className="font-display text-4xl font-bold text-primary-600 dark:text-primary-300">
              {stats.total ? Math.round((stats.collected / (stats.total * 1000)) * 100) : 0}%
            </span>
          </div>
          <Link to="/janab/students" className="text-sm font-semibold text-brass-600 hover:underline dark:text-brass-300">
            View all students →
          </Link>
        </motion.div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink dark:text-primary-50">Recent Students</h3>
          <Link to="/janab/students" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card-surface flex flex-col items-center justify-center gap-2 p-12 text-center">
            <Users className="h-8 w-8 text-ink/25" />
            <p className="font-medium text-ink/60 dark:text-primary-100/60">No students registered yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((student, i) => (
              <StudentCard key={student.id} student={student} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
