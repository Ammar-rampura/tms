export type Program = 'Tahfeez' | 'Taiseer' | 'Atfaal'

export type FeeStatus = 'Paid' | 'Partial' | 'Due' | 'Skipped'

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

export interface DatabaseFeeRecord {
  id: string
  student_id: string
  billing_month: number
  billing_year: number
  billing_date: string
  due_date: string
  original_fee: number
  scholarship_amount: number
  amount: number
  paid_amount: number
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Skipped'
  payment_date: string | null
  payment_method: string | null
  receipt_number: string | null
  remarks: string | null
  remark: string | null
  created_at: string
  updated_at: string
  students?: {
    id: string
    name: string
    its: string
  }
}

export interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  studentIts: string
  billingMonth: number
  billingYear: number
  billingDate: string
  dueDate: string
  originalFee: number
  scholarshipAmount: number
  amount: number
  paidAmount: number
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Skipped'
  paymentDate: string | null
  paymentMethod: string | null
  receiptNumber: string | null
  remarks: string | null
  remark: string | null
  outstandingBalance: number
  outstandingRecords: FeeRecord[]
}

export interface PaymentResultRecord {
  billingMonth: number
  billingYear: number
  monthLabel: string
  amountApplied: number
  remainingDue: number
  status: 'Pending' | 'Partially Paid' | 'Paid'
}

export interface PaymentResult {
  success: boolean
  paymentApplied: number
  recordsUpdated: number
  remainingAmount: number
  updatedRecords: PaymentResultRecord[]
}
