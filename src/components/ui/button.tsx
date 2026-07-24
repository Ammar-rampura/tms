import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:shadow-md',
        brass:
          'bg-brass-500 text-primary-900 shadow-soft hover:bg-brass-400',
        outline:
          'border border-primary-900/15 dark:border-primary-100/15 bg-transparent hover:bg-primary-900/[0.04] dark:hover:bg-primary-100/[0.06]',
        ghost: 'hover:bg-primary-900/[0.05] dark:hover:bg-primary-100/[0.08]',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
        subtle: 'bg-primary-50 text-primary-700 dark:bg-primary-100/10 dark:text-primary-100 hover:bg-primary-100',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-5',
        lg: 'h-13 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
