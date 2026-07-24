import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export function AlertDialogContent({ className, children, ...props }: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-primary-900/40 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary-900/10 dark:border-primary-100/10 bg-panel dark:bg-primary-800 p-6 shadow-card',
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

export const AlertDialogTitle = ({ className, ...props }: AlertDialogPrimitive.AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title className={cn('font-display text-lg font-semibold', className)} {...props} />
)
export const AlertDialogDescription = ({ className, ...props }: AlertDialogPrimitive.AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description className={cn('mt-2 text-sm text-ink/60 dark:text-primary-100/60', className)} {...props} />
)
export const AlertDialogAction = AlertDialogPrimitive.Action
export const AlertDialogCancel = AlertDialogPrimitive.Cancel
