import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarCheck,
  LineChart,
  ChevronsLeft,
  BookOpenText,
  LogOut,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  disabled?: boolean
}

export const janabItems: NavItem[] = [
  { to: '/janab', label: 'Overview', icon: LayoutDashboard },
  { to: '/janab/students', label: 'Students', icon: Users },
  { to: '/janab/attendance', label: 'Attendance', icon: CalendarCheck, disabled: true },
  { to: '/janab/performance', label: 'Performance', icon: LineChart, disabled: true },
]

export const accountsItems: NavItem[] = [
  { to: '/accounts', label: 'Fee Collection', icon: Wallet },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const items = user?.role === 'janab' ? janabItems : accountsItems

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="relative hidden shrink-0 flex-col border-r border-primary-900/[0.06] dark:border-primary-100/10 bg-panel/80 dark:bg-primary-800/40 backdrop-blur-xl md:flex"
    >
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-soft">
          <BookOpenText className="h-5 w-5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              <p className="font-display text-sm font-semibold leading-tight text-ink dark:text-primary-50">Tahfeez</p>
              <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Management System</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/janab' || item.to === '/accounts'}
            onClick={(e) => item.disabled && e.preventDefault()}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                item.disabled
                  ? 'cursor-not-allowed text-ink/30 dark:text-primary-100/25'
                  : isActive
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-ink/65 hover:bg-primary-900/[0.05] dark:text-primary-100/70 dark:hover:bg-primary-100/[0.06]',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                  {item.disabled && <span className="ml-1.5 text-[10px] opacity-60">Soon</span>}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1.5 border-t border-primary-900/[0.06] dark:border-primary-100/10 p-3">
        {(user?.role === 'janab' || user?.role === 'accounts') && (
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink/70 hover:bg-primary-900/[0.05] dark:text-primary-100/70 dark:hover:bg-primary-100/[0.06]"
          >
            <KeyRound className="h-[18px] w-[18px]" />
            {!collapsed && 'Change Password'}
          </button>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && 'Sign out'}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink/50 hover:bg-primary-900/[0.05] dark:text-primary-100/50 dark:hover:bg-primary-100/[0.06]"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} className="flex">
            <ChevronsLeft className="h-[18px] w-[18px]" />
          </motion.span>
          {!collapsed && 'Collapse'}
        </button>
      </div>

      <ChangePasswordDialog 
        open={showPasswordDialog} 
        onOpenChange={setShowPasswordDialog} 
      />
    </motion.aside>
  )
}
