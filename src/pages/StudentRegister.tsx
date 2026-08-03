import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpenText, IndianRupee, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label, FieldError } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RegistrationStepper } from '@/components/RegistrationStepper'
import { CredentialCard } from '@/components/CredentialCard'
import { useData } from '@/context/DataContext'
import { MARAHIL } from '@/lib/quran'
import type { Student } from '@/types'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  age: z.coerce.number(),
  its: z.string().regex(/^\d{8}$/, 'ITS number must be exactly 8 digits'),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  fatherName: z.string().min(2, "Father's name is required"),
  fatherIts: z.string().regex(/^\d{8}$/, "Father's ITS must be exactly 8 digits"),
  motherName: z.string().min(2, "Mother's name is required"),
  motherIts: z.string().regex(/^\d{8}$/, "Mother's ITS must be exactly 8 digits"),
  fatherMobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  motherMobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(5, 'Address is required'),
  program: z.enum(['Tahfeez', 'Taiseer']),
  completedJuz: z.array(z.number()),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const steps = [
  { label: 'Personal', description: 'Basic details' },
  { label: 'Quran Details', description: 'Confirm & submit' },
]

const stepFields: (keyof FormValues)[][] = [
  ['name', 'age', 'its', 'mobile', 'fatherName', 'fatherIts', 'motherName', 'motherIts', 'fatherMobile', 'motherMobile', 'email', 'address', 'program'],
  ['completedJuz', 'remarks'],
]

export function StudentRegister() {
  const [step, setStep] = useState(0)
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [canSubmitForm, setCanSubmitForm] = useState(false)
  const { register: registerStudent } = useData()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { program: 'Tahfeez', completedJuz: [] },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (step === steps.length - 1) {
      const timer = setTimeout(() => setCanSubmitForm(true), 500)
      return () => clearTimeout(timer)
    } else {
      setCanSubmitForm(false)
    }
  }, [step])

  const program = watch('program')
  const completedJuz = watch('completedJuz')

  const toggleJuz = (juz: number) => {
    if (completedJuz.includes(juz)) {
      setValue('completedJuz', completedJuz.filter((j) => j !== juz))
    } else {
      setValue('completedJuz', [...completedJuz, juz])
    }
  }

  async function goNext() {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(values: FormValues) {
    if (step !== steps.length - 1) {
      // Prevent early submission if user hits Enter on an earlier step
      goNext()
      return
    }
    setSubmitting(true)
    try {
      const student = await registerStudent(values)
      setCreatedStudent(student)
      toast.success('Student registered successfully')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (createdStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-16 dark:bg-primary-900">
        <CredentialCard student={createdStudent} onDone={() => navigate('/login')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-12 dark:bg-primary-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink dark:text-primary-100/55 dark:hover:text-primary-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-brass-300 shadow-soft">
            <BookOpenText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink dark:text-primary-50">New Student Registration</h1>
            <p className="text-sm text-ink/55 dark:text-primary-100/55">Takes about two minutes to complete</p>
          </div>
        </div>

        <div className="card-surface p-6 sm:p-8">
          <RegistrationStepper steps={steps} current={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input placeholder="e.g. Ammar " {...register('name')} error={!!errors.name} />
                    <FieldError>{errors.name?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Program</Label>
                    <Select value={program} onValueChange={(v) => setValue('program', v as FormValues['program'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tahfeez">Tahfeez</SelectItem>
                        <SelectItem value="Taiseer">Taiseer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" placeholder="e.g. 12" {...register('age')} error={!!errors.age} />
                    <FieldError>{errors.age?.message}</FieldError>
                  </div>
                  <div>
                    <Label>ITS Number</Label>
                    <Input placeholder="8-digit ITS number" {...register('its')} error={!!errors.its} />
                    <FieldError>{errors.its?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input placeholder="10-digit mobile" {...register('mobile')} error={!!errors.mobile} />
                    <FieldError>{errors.mobile?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Father's Name</Label>
                    <Input placeholder="e.g. Taher Bhai" {...register('fatherName')} error={!!errors.fatherName} />
                    <FieldError>{errors.fatherName?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Father's ITS</Label>
                    <Input placeholder="8-digit ITS number" {...register('fatherIts')} error={!!errors.fatherIts} />
                    <FieldError>{errors.fatherIts?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Mother's Name</Label>
                    <Input placeholder="e.g. Fatema Ben" {...register('motherName')} error={!!errors.motherName} />
                    <FieldError>{errors.motherName?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Mother's ITS</Label>
                    <Input placeholder="8-digit ITS number" {...register('motherIts')} error={!!errors.motherIts} />
                    <FieldError>{errors.motherIts?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Father's Mobile Number</Label>
                    <Input placeholder="10-digit mobile" {...register('fatherMobile')} error={!!errors.fatherMobile} />
                    <FieldError>{errors.fatherMobile?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Mother's Mobile Number</Label>
                    <Input placeholder="10-digit mobile" {...register('motherMobile')} error={!!errors.motherMobile} />
                    <FieldError>{errors.motherMobile?.message}</FieldError>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="e.g. name@example.com" {...register('email')} error={!!errors.email} />
                    <FieldError>{errors.email?.message}</FieldError>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Address</Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink/35 dark:text-primary-100/35" />
                      <Input className="pl-10" placeholder="City, State" {...register('address')} error={!!errors.address} />
                    </div>
                    <FieldError>{errors.address?.message}</FieldError>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4"
                >
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {MARAHIL.map((m) => (
                      <div key={m.id} className="rounded-xl border border-primary-900/10 p-4 dark:border-primary-100/10">
                        <h4 className="mb-2 font-display font-semibold text-ink dark:text-primary-50">{m.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {m.juz.map((j) => {
                            const isChecked = completedJuz.includes(j)
                            return (
                              <label key={j} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary-900/10 bg-white/50 px-2.5 py-1.5 text-sm hover:bg-primary-900/5 dark:border-primary-100/10 dark:bg-primary-900/20 dark:hover:bg-primary-100/5">
                                <input
                                  type="checkbox"
                                  className="accent-primary-600"
                                  checked={isChecked}
                                  onChange={() => toggleJuz(j)}
                                />
                                <span className={isChecked ? 'text-ink font-medium dark:text-primary-50' : 'text-ink/60 dark:text-primary-100/60'}>
                                  Juz {j}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Remarks (optional)</Label>
                    <textarea
                      {...register('remarks')}
                      rows={4}
                      placeholder="Anything the office should know"
                      className="w-full rounded-xl border border-primary-900/12 dark:border-primary-100/12 bg-white/70 dark:bg-primary-900/40 p-3.5 text-sm placeholder:text-ink/40 focus-ring dark:placeholder:text-primary-100/30"
                    />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="brass" disabled={submitting || !canSubmitForm}>
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
