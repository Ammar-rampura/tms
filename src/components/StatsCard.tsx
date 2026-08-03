import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let frame: number
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

interface StatsCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  tone?: 'primary' | 'brass' | 'neutral' | 'destructive'
  index?: number
}

const tones = {
  primary: 'from-primary-600 to-primary-500 text-white',
  brass: 'from-brass-500 to-brass-400 text-primary-900',
  neutral: 'from-ink/90 to-ink/70 text-white',
  destructive: 'from-red-500 to-red-400 text-white',
}

export function StatsCard({ label, value, prefix = '', suffix = '', icon: Icon, tone = 'primary', index = 0 }: StatsCardProps) {
  const animated = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="card-surface relative overflow-hidden p-5"
    >
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-90', tones[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-primary-100/50">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink dark:text-primary-50">
            {prefix}
            {animated.toLocaleString('en-IN')}
            {suffix}
          </p>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-soft', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}
