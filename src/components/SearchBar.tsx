import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search by name, Student ID or ITS...', className }: SearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 dark:text-primary-100/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-primary-900/12 dark:border-primary-100/12 bg-white/70 dark:bg-primary-900/40 pl-10 pr-9 text-sm placeholder:text-ink/40 dark:placeholder:text-primary-100/30 focus-ring"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70 dark:text-primary-100/40"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
