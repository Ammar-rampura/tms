import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Printer, PartyPopper, Sparkles, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from './ui/button'
import type { Student } from '@/types'
import { toast } from 'sonner'
import { StudentIdCard } from './StudentIdCard'

export function CredentialCard({ student, onDone }: { student: Student; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'credentials' | 'idcard'>('credentials')

  // Trigger celebration confetti animation on registration completion
  useEffect(() => {
    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.3 },
      colors: ['#256B5B', '#C29B3E', '#F3E6BE', '#102723'],
    })
    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.7 },
      colors: ['#256B5B', '#C29B3E', '#F3E6BE', '#102723'],
    })
  }, [])

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
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="card-surface mx-auto max-w-lg p-6 sm:p-8 text-center print:shadow-none relative overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brass-400/20 blur-2xl animate-pulse" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-primary-500/15 blur-2xl" />

      {/* Animated Success Badge */}
      <motion.div
        initial={{ rotate: -20, scale: 0.5 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brass-400 via-primary-500 to-primary-700 text-white shadow-glow"
      >
        <PartyPopper className="h-8 w-8 text-brass-100" />
      </motion.div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        <Sparkles className="h-4 w-4 text-brass-500" />
        <h2 className="font-display text-2xl font-bold text-ink dark:text-primary-50">
          Registration Complete!
        </h2>
        <Sparkles className="h-4 w-4 text-brass-500" />
      </div>

      <p className="mt-1 text-sm text-ink/60 dark:text-primary-100/60 max-w-sm mx-auto">
        Welcome to Tahfeez, <span className="font-semibold text-ink dark:text-primary-50">{student.name}</span>. Your student profile and official digital ID are ready.
      </p>

      {/* Tab Switcher: Credentials vs ID Card */}
      <div className="mt-6 flex rounded-xl bg-primary-900/[0.05] p-1 dark:bg-primary-100/[0.06] print:hidden max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'credentials'
              ? 'bg-white text-ink shadow-sm dark:bg-primary-750 dark:text-primary-50'
              : 'text-ink/60 hover:text-ink dark:text-primary-100/60'
          }`}
        >
          Login Credentials
        </button>
        <button
          onClick={() => setActiveTab('idcard')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'idcard'
              ? 'bg-white text-ink shadow-sm dark:bg-primary-750 dark:text-primary-50'
              : 'text-ink/60 hover:text-ink dark:text-primary-100/60'
          }`}
        >
          Student ID Card
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'credentials' ? (
        <motion.div
          key="credentials"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          <div className="rounded-xl border border-primary-900/10 bg-primary-900/[0.03] p-4 text-left dark:border-primary-100/10 dark:bg-primary-100/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45 dark:text-primary-100/45">
              Assigned Student ID
            </p>
            <p className="font-mono text-2xl font-bold tracking-wide text-primary-700 dark:text-primary-200">
              {student.id}
            </p>
          </div>

          <div className="rounded-xl border border-brass-500/25 bg-gradient-to-r from-brass-500/10 via-brass-500/5 to-transparent p-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brass-700/80 dark:text-brass-300/80">
              Generated Password
            </p>
            <p className="font-mono text-2xl font-bold tracking-wide text-brass-700 dark:text-brass-300">
              {student.password}
            </p>
          </div>

          <div className="mt-6 flex gap-3 print:hidden">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print Info
            </Button>
            <Button variant="brass" className="flex-1 shadow-glow" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="idcard"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5"
        >
          <StudentIdCard student={student} />
        </motion.div>
      )}

      <div className="mt-6 pt-4 border-t border-primary-900/[0.06] dark:border-primary-100/[0.08] print:hidden">
        <Button variant="ghost" className="w-full gap-2 text-ink/75 hover:text-ink dark:text-primary-100/80" onClick={onDone}>
          Continue to Login <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
