import { useData } from '@/context/DataContext'
import { Skeleton } from '@/components/Skeleton'
import { HifzLeaderboard } from '@/components/HifzLeaderboard'

export function JanabLeaderboard() {
  const { students, loading } = useData()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink dark:text-primary-50">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-ink/50 dark:text-primary-100/50">
          Hifz-ul-Quran completion rankings and memorization standings
        </p>
      </div>

      <HifzLeaderboard students={students} />
    </div>
  )
}
