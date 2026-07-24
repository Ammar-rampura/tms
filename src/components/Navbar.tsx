import { DarkModeToggle } from './DarkModeToggle'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/utils'

export function Navbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-primary-900/[0.06] dark:border-primary-100/10 bg-paper/70 dark:bg-primary-900/60 px-5 backdrop-blur-xl md:px-8">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-primary-50 md:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50 dark:text-primary-100/50">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <div className="flex items-center gap-2.5 rounded-xl border border-primary-900/10 dark:border-primary-100/10 py-1.5 pl-1.5 pr-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brass-400 to-brass-500 text-xs font-bold text-primary-900">
            {user ? initials(user.name) : ''}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-ink dark:text-primary-50">{user?.name}</p>
            <p className="text-[11px] capitalize text-ink/45 dark:text-primary-100/45">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
