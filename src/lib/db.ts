/**
 * Mock data layer for Tehfiz Management System.
 *
 * Every function here is async and returns plain data, matching the shape
 * a real backend call (Firebase/Supabase/REST) would return. This means
 * swapping the implementation later only requires editing this file -
 * no changes needed in components, contexts, or pages.
 */
import type { PaymentRecord, RegistrationInput, Student } from '@/types'

const STORAGE_KEY = 'tehfiz_students_v1'
const SEQ_KEY = 'tehfiz_student_seq_v1'

const NETWORK_DELAY = 220

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY))
}

function readAll(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Student[]) : []
  } catch {
    return []
  }
}

function writeAll(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

function nextStudentId(): string {
  const current = Number(localStorage.getItem(SEQ_KEY) ?? '0') + 1
  localStorage.setItem(SEQ_KEY, String(current))
  return `STD${String(current).padStart(4, '0')}`
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let pass = ''
  for (let i = 0; i < 6; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass
}

function computeFeeStatus(paid: number, due: number): Student['feeStatus'] {
  if (due <= 0) return 'Paid'
  if (paid > 0) return 'Partial'
  return 'Due'
}

const MONTHLY_FEE = 1000

export const db = {
  MONTHLY_FEE,

  async seedIfEmpty(): Promise<void> {
    if (readAll().length > 0) return
    const demo: Student[] = [
      {
        id: 'STD0001',
        password: 'AB12CD',
        name: 'Ahmed Raza Saifee',
        age: 14,
        its: '30123456',
        mobile: '9876543210',
        fatherName: 'Mohammed Saifee',
        fatherIts: '30123457',
        motherName: 'Zainab Saifee',
        motherIts: '30123458',
        parentNumber: '9876543211',
        email: 'ahmed@example.com',
        address: 'Bhopal, Madhya Pradesh',
        program: 'Tahfeez',
        completedJuz: [30, 29],
        remarks: 'Consistent attendance',
        monthlyFee: MONTHLY_FEE,
        paidAmount: 500,
        dueAmount: 500,
        feeStatus: 'Partial',
        paymentHistory: [{ id: 'p1', date: new Date().toISOString(), amount: 500, note: 'Cash - part payment' }],
        createdDate: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
      {
        id: 'STD0002',
        password: 'XY98ZQ',
        name: 'Yusuf Bhaisaheb',
        age: 12,
        its: '30187654',
        mobile: '9988776655',
        fatherName: 'Taher Bhaisaheb',
        fatherIts: '30187655',
        motherName: 'Fatema Bhaisaheb',
        motherIts: '30187656',
        parentNumber: '9988776656',
        email: 'yusuf@example.com',
        address: 'Indore, Madhya Pradesh',
        program: 'Taiseer',
        completedJuz: [],
        monthlyFee: MONTHLY_FEE,
        paidAmount: 1000,
        dueAmount: 0,
        feeStatus: 'Paid',
        paymentHistory: [{ id: 'p1', date: new Date().toISOString(), amount: 1000, note: 'Cash - full payment' }],
        createdDate: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
      {
        id: 'STD0003',
        password: 'QW77ER',
        name: 'Husain Najmuddin',
        age: 16,
        its: '30145678',
        mobile: '9123456780',
        fatherName: 'Najmuddin Ezzi',
        fatherIts: '30145679',
        motherName: 'Sakina Ezzi',
        motherIts: '30145680',
        parentNumber: '9123456781',
        email: 'husain@example.com',
        address: 'Ujjain, Madhya Pradesh',
        program: 'Tahfeez',
        completedJuz: [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        monthlyFee: MONTHLY_FEE,
        paidAmount: 0,
        dueAmount: 1000,
        feeStatus: 'Due',
        paymentHistory: [],
        createdDate: new Date().toISOString(),
      },
    ]
    localStorage.setItem(SEQ_KEY, '3')
    writeAll(demo)
    await delay(null)
  },

  async getAll(): Promise<Student[]> {
    return delay(readAll().slice().sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)))
  },

  async getById(id: string): Promise<Student | null> {
    const found = readAll().find((s) => s.id.toLowerCase() === id.toLowerCase()) ?? null
    return delay(found)
  },

  async authenticateStudent(id: string, password: string): Promise<Student | null> {
    const found = readAll().find(
      (s) => s.id.toLowerCase() === id.toLowerCase() && s.password === password,
    )
    return delay(found ?? null)
  },

  async register(input: RegistrationInput): Promise<Student> {
    const students = readAll()
    const student: Student = {
      id: nextStudentId(),
      password: generatePassword(),
      name: input.name,
      age: input.age,
      its: input.its,
      mobile: input.mobile,
      fatherName: input.fatherName,
      fatherIts: input.fatherIts,
      motherName: input.motherName,
      motherIts: input.motherIts,
      parentNumber: input.parentNumber,
      email: input.email,
      address: input.address,
      program: input.program,
      completedJuz: input.completedJuz,
      remarks: input.remarks,
      monthlyFee: input.monthlyFee,
      paidAmount: 0,
      dueAmount: input.monthlyFee,
      feeStatus: 'Due',
      paymentHistory: [],
      createdDate: new Date().toISOString(),
    }
    students.push(student)
    writeAll(students)
    return delay(student)
  },

  async updateStudent(id: string, patch: Partial<Student>): Promise<Student | null> {
    const students = readAll()
    const idx = students.findIndex((s) => s.id === id)
    if (idx === -1) return delay(null)
    students[idx] = { ...students[idx], ...patch }
    writeAll(students)
    return delay(students[idx])
  },

  async deleteStudent(id: string): Promise<void> {
    const students = readAll().filter((s) => s.id !== id)
    writeAll(students)
    return delay(undefined)
  },

  async recordPayment(id: string, amount: number, note?: string): Promise<Student | null> {
    const students = readAll()
    const idx = students.findIndex((s) => s.id === id)
    if (idx === -1) return delay(null)
    const student = students[idx]
    const record: PaymentRecord = {
      id: `p${Date.now()}`,
      date: new Date().toISOString(),
      amount,
      note,
    }
    const paidAmount = Math.min(student.monthlyFee, student.paidAmount + amount)
    const dueAmount = Math.max(0, student.monthlyFee - paidAmount)
    students[idx] = {
      ...student,
      paidAmount,
      dueAmount,
      feeStatus: computeFeeStatus(paidAmount, dueAmount),
      paymentHistory: [...student.paymentHistory, record],
    }
    writeAll(students)
    return delay(students[idx])
  },
}
