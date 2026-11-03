import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, Crown, Sparkles, BookOpen, ChevronRight, Search, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Student } from '@/types'
import { getMarhalaStatus } from '@/lib/quran'

interface HifzLeaderboardProps {
  students: Student[]
}

export function HifzLeaderboard({ students }: HifzLeaderboardProps) {
  const [filterProgram, setFilterProgram] = useState<'All' | 'Tahfeez' | 'Taiseer' | 'Atfaal'>('All')
  const [search, setSearch] = useState('')
  const [viewLimit, setViewLimit] = useState<number>(10)

  // Rank active students with completed Juz
  const rankedStudents = useMemo(() => {
    let list = students.filter((s) => s.status === 'active')

    if (filterProgram !== 'All') {
      list = list.filter((s) => s.program === filterProgram)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.its.includes(q) ||
          s.id.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => {
      const countA = a.completedJuz?.length || 0
      const countB = b.completedJuz?.length || 0
      if (countB !== countA) return countB - countA
      return a.name.localeCompare(b.name)
    })
  }, [students, filterProgram, search])

  const top3 = rankedStudents.slice(0, 3)
  const displayList = rankedStudents.slice(0, viewLimit)

  // Top podium order: 2nd place (left), 1st place (center), 3rd place (right)
  const podiumOrder = [
    { rank: 2, student: top3[1] },
    { rank: 1, student: top3[0] },
    { rank: 3, student: top3[2] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-surface relative overflow-hidden rounded-2xl border border-primary-900/[0.08] dark:border-primary-100/10 shadow-soft"
    >
      {/* Background Decorative Accents */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-brass-400/15 via-primary-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-gradient-to-tr from-primary-600/10 via-brass-500/10 to-transparent blur-2xl" />

      {/* Header */}
      <div className="relative border-b border-primary-900/[0.06] dark:border-primary-100/[0.08] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brass-400 to-brass-600 text-white shadow-glow">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-ink dark:text-primary-50">
                  Hifz-ul-Quran Leaderboard
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-brass-400/15 px-2.5 py-0.5 text-xs font-semibold text-brass-700 dark:text-brass-300">
                  <Sparkles className="h-3 w-3" /> Live Standings
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink/55 dark:text-primary-100/55">
                Recognizing students leading in completed Juz memorization
              </p>
            </div>
          </div>

          {/* Program Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-primary-900/[0.04] p-1 dark:bg-primary-100/[0.05]">
              {(['All', 'Tahfeez', 'Taiseer', 'Atfaal'] as const).map((prog) => (
                <button
                  key={prog}
                  onClick={() => setFilterProgram(prog)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    filterProgram === prog
                      ? 'bg-white text-ink shadow-sm dark:bg-primary-700 dark:text-primary-50'
                      : 'text-ink/60 hover:text-ink dark:text-primary-100/60 dark:hover:text-primary-50'
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-xl border border-primary-900/10 bg-white/70 pl-8 pr-3 text-xs placeholder:text-ink/40 focus:border-brass-400 focus:outline-none dark:border-primary-100/10 dark:bg-primary-900/40 dark:text-primary-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards (if enough data and no specific text search query) */}
      {!search.trim() && top3.length > 0 && (
        <div className="relative border-b border-primary-900/[0.06] bg-gradient-to-b from-paper/60 to-transparent p-6 dark:border-primary-100/[0.08] dark:from-primary-900/30">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {podiumOrder.map(({ rank, student }) => {
              if (!student) return null
              const juzCount = student.completedJuz?.length || 0
              const marhala = getMarhalaStatus(student.completedJuz)
              const isFirst = rank === 1

              return (
                <motion.div
                  key={student.id}
                  whileHover={{ y: -3 }}
                  className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                    isFirst
                      ? 'border-brass-400/40 bg-gradient-to-b from-brass-400/15 via-white/80 to-white/60 dark:from-brass-500/15 dark:via-primary-800/80 dark:to-primary-800/40 shadow-glow sm:order-2 sm:-translate-y-2'
                      : rank === 2
                        ? 'border-slate-300/40 bg-white/60 dark:border-slate-600/30 dark:bg-primary-800/40 sm:order-1'
                        : 'border-amber-700/20 bg-white/60 dark:border-amber-700/20 dark:bg-primary-800/40 sm:order-3'
                  }`}
                >
                  {/* Badge & Crown */}
                  <div className="relative mb-3 flex items-center justify-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-soft font-display font-bold text-xl ${
                        isFirst
                          ? 'bg-gradient-to-tr from-brass-400 to-brass-500 text-white shadow-glow'
                          : rank === 2
                            ? 'bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-800 dark:from-slate-600 dark:to-slate-700 dark:text-slate-100'
                            : 'bg-gradient-to-tr from-amber-600/80 to-amber-700 text-amber-50'
                      }`}
                    >
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                        isFirst
                          ? 'bg-brass-500 ring-2 ring-white dark:ring-primary-800'
                          : rank === 2
                            ? 'bg-slate-500 ring-2 ring-white dark:ring-primary-800'
                            : 'bg-amber-700 ring-2 ring-white dark:ring-primary-800'
                      }`}
                    >
                      {rank}
                    </div>
                    {isFirst && (
                      <Crown className="absolute -top-3.5 h-6 w-6 text-brass-500 drop-shadow-md animate-bounce" />
                    )}
                  </div>

                  <Link
                    to={`/janab/students/${student.id}`}
                    className="font-display font-bold text-ink hover:text-primary-600 dark:text-primary-50 dark:hover:text-brass-300 line-clamp-1 text-sm sm:text-base"
                    title={student.name}
                  >
                    {student.name}
                  </Link>
                  <p className="font-mono text-[11px] text-ink/45 dark:text-primary-100/45">
                    ITS: {student.its}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 rounded-full bg-primary-900/[0.04] px-3 py-1 text-xs dark:bg-primary-100/[0.06]">
                    <Flame className="h-3.5 w-3.5 text-brass-500" />
                    <span className="font-bold text-ink dark:text-primary-50">
                      {juzCount}
                    </span>
                    <span className="text-ink/60 dark:text-primary-100/60">/ 30 Juz</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400"
                        style={{ width: `${Math.round((juzCount / 30) * 100)}%` }}
                      />
                    </div>
                    <span className="mt-1 block text-[10px] font-medium text-ink/50 dark:text-primary-100/50">
                      {marhala.text}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ranked Table / List */}
      <div className="p-4 sm:p-6">
        {rankedStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-ink/50 dark:text-primary-100/50">
            <BookOpen className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm font-medium">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary-900/[0.06] text-[11px] font-semibold uppercase tracking-wider text-ink/45 dark:border-primary-100/[0.08] dark:text-primary-100/45">
                  <th className="pb-3 pl-3">Rank</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Program</th>
                  <th className="pb-3">Hifz Progress</th>
                  <th className="pb-3">Marhala Status</th>
                  <th className="pb-3 pr-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-900/[0.04] dark:divide-primary-100/[0.04]">
                <AnimatePresence>
                  {displayList.map((student, idx) => {
                    const rank = idx + 1
                    const juzCount = student.completedJuz?.length || 0
                    const percent = Math.round((juzCount / 30) * 100)
                    const marhala = getMarhalaStatus(student.completedJuz)

                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group hover:bg-primary-900/[0.02] dark:hover:bg-primary-100/[0.02] transition-colors"
                      >
                        {/* Rank */}
                        <td className="py-3 pl-3">
                          <div className="flex items-center gap-1.5">
                            {rank === 1 ? (
                              <Crown className="h-4 w-4 text-brass-500" />
                            ) : rank === 2 ? (
                              <Medal className="h-4 w-4 text-slate-400" />
                            ) : rank === 3 ? (
                              <Award className="h-4 w-4 text-amber-600" />
                            ) : (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-900/[0.05] font-mono text-[11px] font-medium text-ink/70 dark:bg-primary-100/[0.08] dark:text-primary-100/70">
                                {rank}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Student Name & ITS */}
                        <td className="py-3">
                          <Link
                            to={`/janab/students/${student.id}`}
                            className="font-medium text-ink group-hover:text-primary-600 dark:text-primary-50 dark:group-hover:text-brass-300"
                          >
                            {student.name}
                          </Link>
                          <p className="font-mono text-xs text-ink/40 dark:text-primary-100/40">
                            ITS: {student.its}
                          </p>
                        </td>

                        {/* Program */}
                        <td className="py-3">
                          <span className="inline-block rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-400/15 dark:text-primary-200">
                            {student.program}
                          </span>
                        </td>

                        {/* Juz Progress Bar */}
                        <td className="py-3">
                          <div className="w-36 sm:w-48">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-mono font-bold text-ink dark:text-primary-50">
                                {juzCount} / 30 Juz
                              </span>
                              <span className="font-mono text-xs text-ink/45 dark:text-primary-100/45">
                                {percent}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Marhala */}
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

                        {/* Action Link */}
                        <td className="py-3 pr-3 text-right">
                          <Link
                            to={`/janab/students/${student.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-brass-300 dark:hover:text-brass-200"
                          >
                            View <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Show More / Show All footer */}
        {rankedStudents.length > viewLimit && (
          <div className="mt-4 flex items-center justify-between border-t border-primary-900/[0.06] pt-4 dark:border-primary-100/[0.08]">
            <span className="text-xs text-ink/50 dark:text-primary-100/50">
              Showing {displayList.length} of {rankedStudents.length} students
            </span>
            <button
              onClick={() => setViewLimit((prev) => prev + 15)}
              className="rounded-xl border border-primary-900/10 px-4 py-1.5 text-xs font-semibold text-ink hover:bg-primary-900/[0.04] dark:border-primary-100/10 dark:text-primary-50 dark:hover:bg-primary-100/[0.05]"
            >
              Show More Leaders
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

