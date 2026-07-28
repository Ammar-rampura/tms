export type Program = 'Tahfeez' | 'Taiseer'

export type FeeStatus = 'Paid' | 'Partial' | 'Due'

export interface PaymentRecord {
  id: string
  date: string // ISO date
  amount: number
  note?: string
}

export interface Student {
  id: string // e.g. STD0001
  password: string // demo only - plaintext for mock backend
  name: string
  age: number
  its: string
  mobile: string
  fatherName: string
  fatherIts: string
  motherName: string
  motherIts: string
  fatherMobile: string
  motherMobile: string
  email: string
  address: string
  program: Program
  completedJuz: number[]
  remarks?: string
  monthlyFee: number
  paidAmount: number
  dueAmount: number
  feeStatus: FeeStatus
  paymentHistory: PaymentRecord[]
  createdDate: string // ISO date
  status: 'active' | 'inactive'
}

export type Role = 'janab' | 'accounts' | 'student'

export interface AuthUser {
  role: Role
  id: string // username or student id
  name: string
}

export interface RegistrationInput {
  name: string
  age: number
  its: string
  mobile: string
  fatherName: string
  fatherIts: string
  motherName: string
  motherIts: string
  fatherMobile: string
  motherMobile: string
  email: string
  address: string
  program: Program
  completedJuz: number[]
  remarks?: string
}
