import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, CalendarCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { Student } from '@/types'
import { ProfileCard } from '@/components/ProfileCard'
import { FeeCard } from '@/components/FeeCard'
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Skeleton } from '@/components/Skeleton'
import { Button } from '@/components/ui/button'
import { BookOpenText } from 'lucide-react'

export function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    db.getById(user.id).then((s) => {
      setStudent(s)
      setLoading(false)
    })
  }, [user])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-primary-900">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-primary-900/[0.06] bg-paper/70 px-5 backdrop-blur-xl dark:border-primary-100/10 dark:bg-primary-900/60 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-soft">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-ink dark:text-primary-50">Tahfeez</p>
            <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Student Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : !student ? (
          <p className="text-center text-ink/50">Student record not found.</p>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl font-semibold text-ink dark:text-primary-50">
                Assalamu Alaikum, {student.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-ink/55 dark:text-primary-100/55">Here is your profile and fee overview.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProfileCard student={student} />
              <FeeCard student={student} />
            </div>

            <div className="card-surface p-5">
              <h3 className="mb-4 font-display text-base font-semibold text-ink dark:text-primary-50">Payment History</h3>
              <PaymentHistoryTable history={student.paymentHistory} />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="card-surface flex flex-col items-center justify-center gap-2 p-8 text-center">
                <LineChart className="h-8 w-8 text-primary-400" />
                <p className="font-display font-semibold text-ink dark:text-primary-50">Performance</p>
                <p className="text-sm text-ink/50 dark:text-primary-100/50">Performance Module Coming Soon</p>
              </div>
              <div className="card-surface flex flex-col items-center justify-center gap-2 p-8 text-center">
                <CalendarCheck className="h-8 w-8 text-brass-400" />
                <p className="font-display font-semibold text-ink dark:text-primary-50">Attendance</p>
                <p className="text-sm text-ink/50 dark:text-primary-100/50">Attendance Module Coming Soon</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
