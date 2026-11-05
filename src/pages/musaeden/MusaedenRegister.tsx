import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, UserCheck, ShieldCheck, MapPin, Mail, Phone, User, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label, FieldError } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MusaedenCredentialCard } from '@/components/MusaedenCredentialCard'
import { db } from '@/lib/db'
import type { Musaeden } from '@/types'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  its: z.string().regex(/^\d{8}$/, 'ITS number must be exactly 8 digits'),
  gender: z.enum(['Male', 'Female']),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function MusaedenRegister() {
  const [createdMusaed, setCreatedMusaed] = useState<Musaeden | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'Male' },
    mode: 'onBlur',
  })

  const gender = watch('gender')

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const musaed = await db.registerMusaeden({
        name: values.name,
        its: values.its,
        gender: values.gender,
        mobile: values.mobile,
        email: values.email || undefined,
        address: values.address || undefined,
      })
      setCreatedMusaed(musaed)
      toast.success('Musaed registered successfully!')
    } catch (err) {
      console.error('Musaed registration error:', err)
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please make sure the musaeden table exists in Supabase.')
    } finally {
      setSubmitting(false)
    }
  }

  if (createdMusaed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-16 dark:bg-primary-900">
        <MusaedenCredentialCard musaed={createdMusaed} onDone={() => navigate('/login')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-12 dark:bg-primary-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink dark:text-primary-100/55 dark:hover:text-primary-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brass-500 to-primary-700 text-white shadow-soft">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink dark:text-primary-50">
              Musaeden Registration
            </h1>
            <p className="text-sm text-ink/55 dark:text-primary-100/55">
              Enroll as an authorized Quran listener (Muhaffiz Assistant)
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                  <Input className="pl-10" placeholder="e.g. Mulla Mustafa Bhai" {...register('name')} error={!!errors.name} />
                </div>
                <FieldError>{errors.name?.message}</FieldError>
              </div>

              <div>
                <Label>ITS Number</Label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                  <Input className="pl-10" placeholder="8-digit ITS number" {...register('its')} error={!!errors.its} />
                </div>
                <FieldError>{errors.its?.message}</FieldError>
              </div>

              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setValue('gender', v as 'Male' | 'Female')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male (Bhai)</SelectItem>
                    <SelectItem value="Female">Female (Ben)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                  <Input className="pl-10" placeholder="10-digit mobile number" {...register('mobile')} error={!!errors.mobile} />
                </div>
                <FieldError>{errors.mobile?.message}</FieldError>
              </div>

              <div>
                <Label>Email Address <span className="text-xs text-ink/40 dark:text-primary-100/40 font-normal">(Optional)</span></Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                  <Input className="pl-10" type="email" placeholder="name@example.com" {...register('email')} error={!!errors.email} />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </div>

              <div className="sm:col-span-2">
                <Label>Address <span className="text-xs text-ink/40 dark:text-primary-100/40 font-normal">(Optional)</span></Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                  <Input className="pl-10" placeholder="City, Mohalla / Area" {...register('address')} error={!!errors.address} />
                </div>
                <FieldError>{errors.address?.message}</FieldError>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-900/[0.06] dark:border-primary-100/[0.08]">
              <Button type="submit" variant="brass" className="w-full shadow-glow" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register as Musaed'}
              </Button>
            </div>
          </form>

          {/* Already registered existing profile link */}
          <div className="mt-5 rounded-xl border border-primary-900/10 bg-primary-900/[0.02] p-4 text-center dark:border-primary-100/10 dark:bg-primary-100/[0.02]">
            <p className="text-xs text-ink/60 dark:text-primary-100/60">
              Already registered as a Musaed?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-brass-300">
                Sign in to your Musaeden Panel →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

