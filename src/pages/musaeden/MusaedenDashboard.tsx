import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  BookOpenText,
  CheckCircle2,
  LogOut,
  KeyRound,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import type { Student, Musaeden } from '@/types'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Skeleton } from '@/components/Skeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MARAHIL, getMarhalaStatus } from '@/lib/quran'

export function MusaedenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [musaed, setMusaed] = useState<Musaeden | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  // Filtering & search
  const [query, setQuery] = useState('')
  const [programFilter, setProgramFilter] = useState<'All' | 'Tahfeez' | 'Taiseer' | 'Atfaal'>('All')

  // Student details modal
  const [activeStudent, setActiveStudent] = useState<Student | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        if (!user) return
        const [mInfo, stdList] = await Promise.all([
          db.getMusaedenById(user.id),
          db.getAll(),
        ])
        if (!isMounted) return
        setMusaed(mInfo)
        setStudents((stdList || []).filter((s: Student) => s.status === 'active'))
      } catch (err) {
        console.error('Failed to load musaeden dashboard:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [user])

  const filteredStudents = useMemo(() => {
    let result = students

    if (programFilter !== 'All') {
      result = result.filter((s) => s.program === programFilter)
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.its.includes(q) ||
          s.id.toLowerCase().includes(q)
      )
    }

    return result
  }, [students, programFilter, query])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Quick stats
  const totalStudents = students.length
  const completedHifz = students.filter((s) => (s.completedJuz?.length || 0) === 30).length
  const inProgress = students.filter(
    (s) => (s.completedJuz?.length || 0) > 0 && (s.completedJuz?.length || 0) < 30
  ).length

  return (
    <div className="min-h-screen bg-paper dark:bg-primary-900">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-primary-900/[0.06] bg-paper/70 px-5 backdrop-blur-xl dark:border-primary-100/10 dark:bg-primary-900/60 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brass-500 to-primary-700 text-white shadow-soft">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-sm font-semibold leading-tight text-ink dark:text-primary-50">
                Tahfeez
              </p>
              <span className="rounded-full bg-brass-400/20 px-2 py-0.5 text-[10px] font-bold text-brass-700 dark:text-brass-300">
                Musaeden Panel
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">
              Quran Listening & Sabaq Review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
            <KeyRound className="h-4 w-4" /> <span className="hidden sm:inline">Change Password</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 space-y-6">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface relative overflow-hidden p-6"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brass-400/15 blur-2xl" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-ink dark:text-primary-50">
                    Ahlan wa Sahlan, {musaed?.name || user?.name}
                  </h1>
                  <p className="mt-1 text-sm text-ink/55 dark:text-primary-100/55">
                    Musaed ID: <span className="font-mono font-semibold text-primary-700 dark:text-brass-300">{musaed?.id}</span> • ITS: <span className="font-mono font-semibold text-ink/75 dark:text-primary-100/75">{musaed?.its}</span>
                  </p>
                </div>

                {/* Quick stats pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-primary-900/10 bg-white/60 px-3.5 py-2 text-center dark:border-primary-100/10 dark:bg-primary-800/40">
                    <p className="text-[10px] uppercase tracking-wider text-ink/45 dark:text-primary-100/45 font-semibold">Active Students</p>
                    <p className="font-display text-lg font-bold text-ink dark:text-primary-50">{totalStudents}</p>
                  </div>
                  <div className="rounded-xl border border-primary-900/10 bg-white/60 px-3.5 py-2 text-center dark:border-primary-100/10 dark:bg-primary-800/40">
                    <p className="text-[10px] uppercase tracking-wider text-ink/45 dark:text-primary-100/45 font-semibold">In Progress</p>
                    <p className="font-display text-lg font-bold text-primary-600 dark:text-primary-300">{inProgress}</p>
                  </div>
                  <div className="rounded-xl border border-brass-400/30 bg-brass-400/10 px-3.5 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-brass-700 dark:text-brass-300 font-semibold">Full Quran Hifz</p>
                    <p className="font-display text-lg font-bold text-brass-700 dark:text-brass-300">{completedHifz}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Students List for Quran Listening */}
            <div className="card-surface p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink dark:text-primary-50 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-600 dark:text-brass-400" />
                    Students for Sabaq & Quran Listening
                  </h3>
                  <p className="text-xs text-ink/50 dark:text-primary-100/50 mt-0.5">
                    View student memorization records, completed Juz, and Marhala status
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl bg-primary-900/[0.04] p-1 dark:bg-primary-100/[0.05]">
                    {(['All', 'Tahfeez', 'Taiseer', 'Atfaal'] as const).map((prog) => (
                      <button
                        key={prog}
                        onClick={() => setProgramFilter(prog)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                          programFilter === prog
                            ? 'bg-white text-ink shadow-sm dark:bg-primary-700 dark:text-primary-50'
                            : 'text-ink/60 hover:text-ink dark:text-primary-100/60'
                        }`}
                      >
                        {prog}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink/35 dark:text-primary-100/35" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-8 rounded-xl border border-primary-900/10 bg-white/70 pl-8 pr-3 text-xs placeholder:text-ink/40 focus:border-brass-400 focus:outline-none dark:border-primary-100/10 dark:bg-primary-900/40 dark:text-primary-50"
                    />
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary-900/[0.06] text-[11px] font-semibold uppercase tracking-wider text-ink/45 dark:border-primary-100/[0.08] dark:text-primary-100/45">
                      <th className="pb-3 pl-3">Student</th>
                      <th className="pb-3">Program</th>
                      <th className="pb-3">Completed Juz</th>
                      <th className="pb-3">Current Status</th>
                      <th className="pb-3 pr-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-900/[0.04] dark:divide-primary-100/[0.04]">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ink/50 dark:text-primary-100/50">
                          No students found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => {
                        const juzCount = st.completedJuz?.length || 0
                        const marhala = getMarhalaStatus(st.completedJuz)
                        const pct = Math.round((juzCount / 30) * 100)

                        return (
                          <tr
                            key={st.id}
                            className="group hover:bg-primary-900/[0.02] dark:hover:bg-primary-100/[0.02] transition-colors"
                          >
                            <td className="py-3 pl-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-primary-700 font-display font-bold text-white text-sm">
                                  {st.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-ink dark:text-primary-50">{st.name}</p>
                                  <p className="font-mono text-xs text-ink/40 dark:text-primary-100/40">
                                    ID: {st.id} • ITS: {st.its}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3">
                              <span className="rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-400/15 dark:text-primary-200">
                                {st.program}
                              </span>
                            </td>

                            <td className="py-3">
                              <div className="w-36">
                                <div className="flex justify-between text-xs mb-1 font-mono">
                                  <span className="font-bold text-ink dark:text-primary-50">{juzCount} / 30</span>
                                  <span className="text-ink/45 dark:text-primary-100/45">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  marhala.type === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : marhala.type === 'Pending'
                                      ? 'bg-brass-400/15 text-brass-700 dark:text-brass-300'
                                      : 'bg-primary-900/[0.05] text-ink/50 dark:bg-primary-100/[0.05] dark:text-primary-100/50'
                                }`}
                              >
                                {marhala.text}
                              </span>
                            </td>

                            <td className="py-3 pr-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveStudent(st)}
                                className="h-8 gap-1 text-xs"
                              >
                                View Hifz <ChevronRight className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Student Hifz Detail Dialog */}
      <Dialog open={!!activeStudent} onOpenChange={(open) => !open && setActiveStudent(null)}>
        <DialogContent className="max-w-xl">
          <DialogTitle>Quran Memorization Record</DialogTitle>
          <DialogDescription>
            {activeStudent?.name} • ITS: {activeStudent?.its} • {activeStudent?.program}
          </DialogDescription>

          {activeStudent && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-primary-900/10 bg-primary-900/[0.02] p-4 dark:border-primary-100/10 dark:bg-primary-100/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-ink dark:text-primary-50">Completed Juz Count</span>
                  <span className="font-mono text-base font-bold text-primary-700 dark:text-brass-300">
                    {(activeStudent.completedJuz || []).length} / 30 Juz
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary-900/[0.08] dark:bg-primary-100/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400"
                    style={{
                      width: `${Math.round(((activeStudent.completedJuz || []).length / 30) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* 30 Juz Visual Grid */}
              <div>
                <Label className="mb-2 block">30 Juz Memorization Map</Label>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                    const isCompleted = (activeStudent.completedJuz || []).includes(juzNum)
                    return (
                      <div
                        key={juzNum}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                          isCompleted
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                            : 'border-primary-900/10 bg-white/40 text-ink/40 dark:border-primary-100/10 dark:bg-primary-900/20 dark:text-primary-100/30'
                        }`}
                      >
                        <span className="text-[10px] font-semibold">Juz</span>
                        <span className="font-mono font-bold text-xs">{juzNum}</span>
                        {isCompleted && <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Marhala Breakdown */}
              <div className="space-y-2 pt-2 border-t border-primary-900/[0.06] dark:border-primary-100/[0.08]">
                <Label>Marhala Progress</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {MARAHIL.map((m) => {
                    const isComplete = m.juz.every((j) => (activeStudent.completedJuz || []).includes(j))
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between rounded-lg p-2.5 border ${
                          isComplete
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200'
                            : 'border-primary-900/10 bg-primary-900/[0.02] text-ink/60 dark:border-primary-100/10 dark:text-primary-100/60'
                        }`}
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="font-mono text-[11px]">
                          {isComplete ? '✓ Complete' : 'Incomplete'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-3">
                <Button variant="outline" className="w-full" onClick={() => setActiveStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  )
}
