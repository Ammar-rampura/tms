import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepDef {
  label: string
  description: string
}

export function RegistrationStepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((step, idx) => {
        const isDone = idx < current
        const isActive = idx === current
        return (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 1,
                }}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isDone
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : isActive
                      ? 'border-brass-500 bg-brass-500/10 text-brass-600 dark:text-brass-300'
                      : 'border-primary-900/15 text-ink/35 dark:border-primary-100/15 dark:text-primary-100/30',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
              </motion.div>
              <div className="mt-2 hidden text-center sm:block">
                <p className={cn('text-xs font-semibold', isActive || isDone ? 'text-ink dark:text-primary-50' : 'text-ink/40 dark:text-primary-100/35')}>
                  {step.label}
                </p>
                <p className="text-[11px] text-ink/40 dark:text-primary-100/35">{step.description}</p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="mx-2 h-[2px] flex-1 rounded-full bg-primary-900/10 dark:bg-primary-100/10">
                <motion.div
                  className="h-full rounded-full bg-primary-600"
                  initial={{ width: 0 }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
