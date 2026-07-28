import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { janabItems, accountsItems } from './Sidebar'

export function BottomNav() {
  const { user } = useAuth()
  const items = user?.role === 'janab' ? janabItems : accountsItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-primary-900/[0.06] bg-paper/90 px-2 pb-safe pt-2 backdrop-blur-xl dark:border-primary-100/10 dark:bg-primary-900/90 md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/janab' || item.to === '/accounts'}
          onClick={(e) => item.disabled && e.preventDefault()}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors',
              item.disabled
                ? 'cursor-not-allowed text-ink/30 dark:text-primary-100/25'
                : isActive
                  ? 'text-primary-600 dark:text-primary-300'
                  : 'text-ink/50 hover:bg-primary-900/[0.05] dark:text-primary-100/50 dark:hover:bg-primary-100/[0.06]',
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
