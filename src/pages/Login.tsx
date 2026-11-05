import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenText,
  Crown,
  Wallet,
  GraduationCap,
  Headphones,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type RoleSelection = 'student' | 'musaeden' | 'janab' | 'accounts'
type DialogKind = 'student-login' | 'musaeden-login' | 'janab-login' | 'accounts-login' | null

export function Login() {
  const [selectedRole, setSelectedRole] = useState<RoleSelection>('student')
  const [dialog, setDialog] = useState<DialogKind>(null)
  const navigate = useNavigate()
  const { loginStaff, loginStudent, loginMusaeden } = useAuth()

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

  function openLoginModal(kind: DialogKind) {
    resetForm()
    setDialog(kind)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (dialog === 'janab-login' || dialog === 'accounts-login') {
        const staffRole = dialog === 'janab-login' ? 'janab' : 'accounts'
        const ok = await loginStaff(staffRole, username, password)
        if (!ok) {
          setError('Invalid username or password')
          return
        }
        toast.success(`Welcome back, ${staffRole === 'janab' ? 'Janab' : 'Accounts'}`)
        navigate(staffRole === 'janab' ? '/janab' : '/accounts')
      } else if (dialog === 'student-login') {
        const ok = await loginStudent(username, password)
        if (!ok) {
          setError('Invalid Student ID / ITS or password')
          return
        }
        toast.success('Welcome back!')
        navigate('/student')
      } else if (dialog === 'musaeden-login') {
        const ok = await loginMusaeden(username, password)
        if (!ok) {
          setError('Invalid Musaed ID / ITS or password')
          return
        }
        toast.success('Welcome back, Musaed!')
        navigate('/musaeden')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-glow">
            <BookOpenText className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-primary-50 sm:text-4xl">
            Tahfeez Management System
          </h1>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-ink/55 dark:text-primary-100/55">
            Select your role below to access your portal or register
          </p>
        </motion.div>

        {/* Central Role Selector Pills */}
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-primary-900/[0.04] p-1.5 dark:bg-primary-100/[0.05] border border-primary-900/[0.06] dark:border-primary-100/10">
            <button
              onClick={() => setSelectedRole('student')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all',
                selectedRole === 'student'
                  ? 'bg-white text-primary-700 shadow-soft dark:bg-primary-750 dark:text-brass-300'
                  : 'text-ink/65 hover:text-ink dark:text-primary-100/60 dark:hover:text-primary-50'
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>

            <button
              onClick={() => setSelectedRole('musaeden')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all',
                selectedRole === 'musaeden'
                  ? 'bg-white text-primary-700 shadow-soft dark:bg-primary-750 dark:text-brass-300'
                  : 'text-ink/65 hover:text-ink dark:text-primary-100/60 dark:hover:text-primary-50'
              )}
            >
              <Headphones className="h-4 w-4" />
              <span>Musaeden</span>
            </button>

            <button
              onClick={() => setSelectedRole('janab')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all',
                selectedRole === 'janab'
                  ? 'bg-white text-primary-700 shadow-soft dark:bg-primary-750 dark:text-brass-300'
                  : 'text-ink/65 hover:text-ink dark:text-primary-100/60 dark:hover:text-primary-50'
              )}
            >
              <Crown className="h-4 w-4" />
              <span>Janab</span>
            </button>

            <button
              onClick={() => setSelectedRole('accounts')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all',
                selectedRole === 'accounts'
                  ? 'bg-white text-primary-700 shadow-soft dark:bg-primary-750 dark:text-brass-300'
                  : 'text-ink/65 hover:text-ink dark:text-primary-100/60 dark:hover:text-primary-50'
              )}
            >
              <Wallet className="h-4 w-4" />
              <span>Accounts</span>
            </button>
          </div>

          {/* Dynamic Content Based on Selected Role */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {/* STUDENT ROLE PANEL */}
              {selectedRole === 'student' && (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: New Student Registration */}
                    <div className="card-surface group relative overflow-hidden p-6 flex flex-col justify-between">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 opacity-15" />
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-soft">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-primary-50">
                          New Student Registration
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55">
                          Enroll as a new student, enter your details & generate your Student ID and credentials.
                        </p>
                      </div>
                      <Button
                        className="mt-6 w-full gap-2 shadow-soft"
                        onClick={() => navigate('/register')}
                      >
                        Register as New Student <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Option 2: Existing Student Login */}
                    <div className="card-surface group relative overflow-hidden p-6 flex flex-col justify-between border-brass-400/30">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-brass-500 to-brass-600 opacity-15" />
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brass-500 to-brass-600 text-white shadow-soft">
                          <LogIn className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-primary-50">
                          Existing Student Login
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55">
                          Already registered? Sign in using your Student ID or 8-digit ITS number to view your ID card & fee history.
                        </p>
                      </div>
                      <Button
                        variant="brass"
                        className="mt-6 w-full gap-2 shadow-glow"
                        onClick={() => openLoginModal('student-login')}
                      >
                        Sign In to Profile <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MUSAEDEN ROLE PANEL */}
              {selectedRole === 'musaeden' && (
                <motion.div
                  key="musaeden"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Musaed Registration */}
                    <div className="card-surface group relative overflow-hidden p-6 flex flex-col justify-between">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-brass-500 to-primary-600 opacity-15" />
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brass-500 to-primary-700 text-white shadow-soft">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-primary-50">
                          Musaeden Registration
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55">
                          Register as an authorized Quran listener (Muhaffiz Assistant) with your name, ITS, gender, and contact.
                        </p>
                      </div>
                      <Button
                        className="mt-6 w-full gap-2 shadow-soft"
                        onClick={() => navigate('/musaeden/register')}
                      >
                        Register as Musaed <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Option 2: Existing Musaed Login */}
                    <div className="card-surface group relative overflow-hidden p-6 flex flex-col justify-between border-brass-400/30">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary-600 to-brass-600 opacity-15" />
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-brass-600 text-white shadow-soft">
                          <Headphones className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-primary-50">
                          Existing Musaed Login
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55">
                          Already registered as a Musaed? Sign in using your Musaed ID or ITS number to review students and listen to Sabaq.
                        </p>
                      </div>
                      <Button
                        variant="brass"
                        className="mt-6 w-full gap-2 shadow-glow"
                        onClick={() => openLoginModal('musaeden-login')}
                      >
                        Sign In as Musaed <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* JANAB ROLE PANEL */}
              {selectedRole === 'janab' && (
                <motion.div
                  key="janab"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="card-surface relative overflow-hidden p-6 sm:p-8 text-center max-w-lg mx-auto"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-soft">
                    <Crown className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink dark:text-primary-50">
                    Janab Super Admin
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55 max-w-sm mx-auto">
                    Full administrative control over students, registrations, monthly fee billing, and Hifz leaderboards.
                  </p>
                  <Button
                    className="mt-6 w-full gap-2 shadow-soft"
                    onClick={() => openLoginModal('janab-login')}
                  >
                    Janab Sign In <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* ACCOUNTS ROLE PANEL */}
              {selectedRole === 'accounts' && (
                <motion.div
                  key="accounts"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="card-surface relative overflow-hidden p-6 sm:p-8 text-center max-w-lg mx-auto"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brass-500 to-brass-600 text-white shadow-soft">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink dark:text-primary-50">
                    Accounts Office
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-ink/55 dark:text-primary-100/55 max-w-sm mx-auto">
                    Manage offline fee collection, record student payments, issue receipts, and track monthly dues.
                  </p>
                  <Button
                    variant="brass"
                    className="mt-6 w-full gap-2 shadow-glow"
                    onClick={() => openLoginModal('accounts-login')}
                  >
                    Accounts Sign In <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reusable Login Modal */}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>
            {dialog === 'janab-login' && 'Janab Admin Login'}
            {dialog === 'accounts-login' && 'Accounts Office Login'}
            {dialog === 'student-login' && 'Student Portal Sign In'}
            {dialog === 'musaeden-login' && 'Musaeden Portal Sign In'}
          </DialogTitle>
          <DialogDescription>
            {dialog === 'student-login' && 'Enter your Student ID (or 8-digit ITS number) and password.'}
            {dialog === 'musaeden-login' && 'Enter your Musaed ID (or 8-digit ITS number) and password.'}
            {dialog === 'janab-login' && 'Enter your Janab administrator credentials to continue.'}
            {dialog === 'accounts-login' && 'Enter your Accounts office credentials to continue.'}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <Label>
                {dialog === 'student-login'
                  ? 'Student ID or ITS Number'
                  : dialog === 'musaeden-login'
                    ? 'Musaed ID or ITS Number'
                    : 'Username'}
              </Label>
              <Input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  dialog === 'student-login'
                    ? 'e.g. STD0001 or 30433974'
                    : dialog === 'musaeden-login'
                      ? 'e.g. MSD0001 or 30433974'
                      : 'Enter username'
                }
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
            <Button type="submit" variant="brass" className="w-full shadow-glow" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
