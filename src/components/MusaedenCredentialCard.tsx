import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Printer, PartyPopper, ArrowRight, UserCheck } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from './ui/button'
import type { Musaeden } from '@/types'
import { toast } from 'sonner'

export function MusaedenCredentialCard({ musaed, onDone }: { musaed: Musaeden; onDone: () => void }) {
  const [copied, setCopied] = useState(false)

  // Trigger celebration confetti
  useState(() => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#256B5B', '#C29B3E', '#F3E6BE', '#102723'],
    })
  })

  function handleCopy() {
    navigator.clipboard.writeText(`Musaed ID: ${musaed.id}\nITS: ${musaed.its}\nPassword: ${musaed.password}`)
    setCopied(true)
    toast.success('Credentials copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="card-surface mx-auto max-w-lg p-6 sm:p-8 text-center print:shadow-none relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brass-400/20 blur-2xl animate-pulse" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-primary-500/15 blur-2xl" />

      <motion.div
        initial={{ rotate: -20, scale: 0.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brass-500 via-primary-600 to-primary-700 text-white shadow-glow"
      >
        <UserCheck className="h-8 w-8 text-brass-100" />
      </motion.div>

      <h2 className="mt-4 font-display text-2xl font-bold text-ink dark:text-primary-50">
        Registration Complete!
      </h2>
      <p className="mt-1 text-sm text-ink/60 dark:text-primary-100/60 max-w-sm mx-auto">
        Welcome to the Tahfeez team, <span className="font-semibold text-ink dark:text-primary-50">{musaed.name}</span>. Save your credentials to log in anytime.
      </p>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-primary-900/10 bg-primary-900/[0.03] p-4 text-left dark:border-primary-100/10 dark:bg-primary-100/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45 dark:text-primary-100/45">
            Musaed ID (or login using ITS)
          </p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-2xl font-bold tracking-wide text-primary-700 dark:text-primary-200">
              {musaed.id}
            </p>
            <span className="font-mono text-sm font-semibold text-ink/50 dark:text-primary-100/50">
              ITS: {musaed.its}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-brass-500/25 bg-gradient-to-r from-brass-500/10 via-brass-500/5 to-transparent p-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brass-700/80 dark:text-brass-300/80">
            Generated Password
          </p>
          <p className="font-mono text-2xl font-bold tracking-wide text-brass-700 dark:text-brass-300">
            {musaed.password}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 print:hidden">
        <Button variant="outline" className="flex-1" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button variant="brass" className="flex-1 shadow-glow" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy Credentials'}
        </Button>
      </div>

      <div className="mt-6 pt-4 border-t border-primary-900/[0.06] dark:border-primary-100/[0.08] print:hidden">
        <Button variant="ghost" className="w-full gap-2 text-ink/75 hover:text-ink dark:text-primary-100/80" onClick={onDone}>
          Continue to Login <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

