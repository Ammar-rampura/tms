import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border bg-white/70 dark:bg-primary-900/40 px-3.5 text-sm text-ink dark:text-primary-50 placeholder:text-ink/40 dark:placeholder:text-primary-100/30 transition-colors focus-ring',
        error
          ? 'border-red-400 focus-visible:ring-red-400'
          : 'border-primary-900/12 dark:border-primary-100/12 focus-visible:border-brass-400',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55 dark:text-primary-100/55', className)} {...props} />
)

export const FieldError = ({ children }: { children?: string }) => {
  if (!children) return null
  return <p className="mt-1 text-xs font-medium text-red-500">{children}</p>
}
