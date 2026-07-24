import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative flex h-9 w-16 items-center rounded-full border border-primary-900/10 dark:border-primary-100/15 bg-primary-900/[0.04] dark:bg-primary-100/10 px-1 transition-colors focus-ring"
    >
      <motion.div
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-primary-700 shadow-soft"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      >
        {isDark ? <Moon className="h-3.5 w-3.5 text-brass-300" /> : <Sun className="h-3.5 w-3.5 text-brass-500" />}
      </motion.div>
    </button>
  )
}
