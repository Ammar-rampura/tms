import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Printer, PartyPopper } from 'lucide-react'
import { Button } from './ui/button'
import type { Student } from '@/types'
import { toast } from 'sonner'

export function CredentialCard({ student, onDone }: { student: Student; onDone: () => void }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(`Student ID: ${student.id}\nPassword: ${student.password}`)
    setCopied(true)
    toast.success('Credentials copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="card-surface mx-auto max-w-md p-8 text-center print:shadow-none"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-brass-200 shadow-soft">
        <PartyPopper className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold text-ink dark:text-primary-50">Registration Successful</h2>
      <p className="mt-1 text-sm text-ink/55 dark:text-primary-100/55">
        Welcome, {student.name}. Save these credentials to log in anytime.
      </p>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-primary-900/10 bg-primary-900/[0.03] p-4 text-left dark:border-primary-100/10 dark:bg-primary-100/[0.04]">
          <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Student ID</p>
          <p className="font-mono text-xl font-bold tracking-wide text-primary-700 dark:text-primary-200">{student.id}</p>
        </div>
        <div className="rounded-xl border border-brass-500/20 bg-brass-500/[0.08] p-4 text-left">
          <p className="text-[11px] uppercase tracking-wide text-brass-700/70 dark:text-brass-300/70">Password</p>
          <p className="font-mono text-xl font-bold tracking-wide text-brass-700 dark:text-brass-300">{student.password}</p>
        </div>
        <div className="rounded-xl bg-primary-900/[0.03] p-4 text-left dark:bg-primary-100/[0.04]">
          <p className="text-[11px] uppercase tracking-wide text-ink/45 dark:text-primary-100/45">Monthly Fee</p>
          <p className="mt-0.5 font-mono text-lg font-bold text-ink dark:text-primary-50">₹1000 <span className="text-xs font-sans font-normal text-ink/45">· Payable offline at office</span></p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 print:hidden">
        <Button variant="outline" className="flex-1" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button variant="brass" className="flex-1" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy Credentials'}
        </Button>
      </div>
      <Button variant="ghost" className="mt-2 w-full print:hidden" onClick={onDone}>
        Continue to Login
      </Button>
    </motion.div>
  )
}
