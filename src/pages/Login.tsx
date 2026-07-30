import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpenText, Crown, Wallet, UserPlus, LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type PanelKind = 'janab' | 'accounts' | 'student-login' | null

const cards = [
  {
    key: 'janab' as const,
    title: 'Janab Login',
    description: 'Full administrative control over students and records',
    icon: Crown,
    tone: 'from-primary-600 to-primary-700',
  },
  {
    key: 'accounts' as const,
    title: 'Account Login',
    description: 'Manage offline fee collection and payment history',
    icon: Wallet,
    tone: 'from-brass-500 to-brass-600',
  },
  {
    key: 'register' as const,
    title: 'Student — New Registration',
    description: 'Enroll a new student and generate login credentials',
    icon: UserPlus,
    tone: 'from-primary-500 to-primary-400',
  },
  {
    key: 'student-login' as const,
    title: 'Student — Existing Login',
    description: 'Sign in with your Student ID to view your profile',
    icon: LogIn,
    tone: 'from-ink/80 to-ink/60',
  },
]

export function Login() {
  const [panel, setPanel] = useState<PanelKind>(null)
  const navigate = useNavigate()
  const { loginStaff, loginStudent } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function resetForm() {
    setUsername('')
    setPassword('')
    setError('')
    setShowPassword(false)
  }

  function handleCardClick(key: (typeof cards)[number]['key']) {
    if (key === 'register') {
      navigate('/register')
      return
    }
    resetForm()
    setPanel(key)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (panel === 'janab' || panel === 'accounts') {
        const ok = await loginStaff(panel, username, password)
        if (!ok) {
          setError('Invalid username or password')
          return
        }
        toast.success(`Welcome back, ${panel === 'janab' ? 'Janab' : 'Accounts'}`)
        navigate(panel === 'janab' ? '/janab' : '/accounts')
      } else if (panel === 'student-login') {
        const ok = await loginStudent(username, password)
        if (!ok) {
          setError('Invalid Student ID or password')
          return
        }
        toast.success('Welcome back!')
        navigate('/student')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper dark:bg-primary-900">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brass-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />

      <div className="absolute right-6 top-6 z-10">
        <DarkModeToggle />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-glow">
            <BookOpenText className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-primary-50 sm:text-4xl">
            Tahfeez Management System
          </h1>
          <p className="mt-2 max-w-md text-sm text-ink/55 dark:text-primary-100/55">
            One gateway for administrators, accounts, and students — choose how you'd like to continue.
          </p>
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map((card, idx) => (
            <motion.button
              key={card.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card.key)}
              className="card-surface group relative overflow-hidden p-6 text-left focus-ring"
            >
              <div className={cn('absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 transition-transform duration-500 group-hover:scale-125', card.tone)} />
              <div className={cn('relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft', card.tone)}>
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-4 font-display text-lg font-semibold text-ink dark:text-primary-50">{card.title}</h3>
              <p className="relative mt-1 text-sm text-ink/55 dark:text-primary-100/55">{card.description}</p>
              <div className="relative mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-300">
                Continue
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>


      </div>

      <Dialog open={panel !== null} onOpenChange={(open) => !open && setPanel(null)}>
        <DialogContent>
          <DialogTitle>
            {panel === 'janab' && 'Janab Login'}
            {panel === 'accounts' && 'Account Login'}
            {panel === 'student-login' && 'Student Login'}
          </DialogTitle>
          <DialogDescription>
            {panel === 'student-login'
              ? 'Enter the Student ID and password you received at registration.'
              : 'Enter your staff username and password to continue.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <Label>{panel === 'student-login' ? 'Student ID' : 'Username'}</Label>
              <Input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={panel === 'student-login' ? 'e.g. STD0001' : 'Enter username'}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-primary-100/40"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
