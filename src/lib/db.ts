import type { PaymentRecord, RegistrationInput, Student, FeeRecord, PaymentResult, PaymentResultRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export interface DatabaseStaff {
  role: 'janab' | 'accounts'
  password: string
  name: string
}

interface DatabaseStudent {
  id: string
  password: string
  name: string
  age: number
  its: string
  mobile: string
  father_name: string
  father_its: string
  mother_name: string
  mother_its: string
  father_mobile: string
  mother_mobile: string
  email: string
  address: string
  program: 'Tahfeez' | 'Taiseer'
  completed_juz: number[]
  remarks: string
  monthly_fee: number
  paid_amount: number
  due_amount: number
  fee_status: 'Paid' | 'Partial' | 'Due' | 'Skipped'
  payment_history: PaymentRecord[]
  created_date: string
  status: 'active' | 'inactive'
}

function handleDbError(error: unknown, context: string): never {
  console.error(`Database error during ${context}:`, error)
  
  const errObj = error as Record<string, unknown>
  
  if (errObj?.code === '23505' || (typeof errObj?.message === 'string' && errObj.message.includes('duplicate key value'))) {
    throw new Error('Student with this ITS already exists')
  }
  if (errObj?.code === 'PGRST116') {
    throw new Error('Student not found')
  }
  if (typeof errObj?.message === 'string' && (errObj.message.includes('fetch') || errObj.message.includes('network'))) {
    throw new Error('Database unavailable. Please check your connection.')
  }
  
  throw new Error(typeof errObj?.message === 'string' ? errObj.message : 'Unknown database error')
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

function databaseToStudent(row: DatabaseStudent): Student {
  return {
    id: row.id,
    password: row.password,
    name: row.name,
    age: row.age,
    its: row.its,
    mobile: row.mobile,
    fatherName: row.father_name,
    fatherIts: row.father_its,
    motherName: row.mother_name,
    motherIts: row.mother_its,
    fatherMobile: row.father_mobile,
    motherMobile: row.mother_mobile,
    email: row.email,
    address: row.address,
    program: row.program,
    completedJuz: row.completed_juz || [],
    remarks: row.remarks,
    monthlyFee: row.monthly_fee,
    paidAmount: row.paid_amount,
    dueAmount: row.due_amount,
    feeStatus: row.fee_status,
    paymentHistory: row.payment_history || [],
    createdDate: row.created_date,
    status: row.status,
  }
}

function studentToDatabase(student: Student): DatabaseStudent {
  return {
    id: student.id,
    password: student.password,
    name: student.name,
    age: student.age,
    its: student.its,
    mobile: student.mobile,
    father_name: student.fatherName,
    father_its: student.fatherIts,
    mother_name: student.motherName,
    mother_its: student.motherIts,
    father_mobile: student.fatherMobile,
    mother_mobile: student.motherMobile,
    email: student.email,
    address: student.address,
    program: student.program,
    completed_juz: student.completedJuz,
    remarks: student.remarks || '',
    monthly_fee: student.monthlyFee,
    paid_amount: student.paidAmount,
    due_amount: student.dueAmount,
    fee_status: student.feeStatus,
    payment_history: student.paymentHistory,
    created_date: student.createdDate,
    status: student.status,
  }
}

let isSubscribed = false

function initRealtime() {
  if (isSubscribed || typeof window === 'undefined') return
  isSubscribed = true

  const channelName = 'students-changes'
  if (supabase.getChannels().some(c => c.topic === `realtime:${channelName}`)) {
    return
  }

  supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students' },
      () => {
        window.dispatchEvent(new Event('storage'))
      }
    )
    .subscribe()
}

initRealtime()

export const db = {
  MONTHLY_FEE,

  async seedIfEmpty(): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
      
      if (error) handleDbError(error, 'checking student count for seeding')

      if (count && count > 0) return

      const demoStudents: Student[] = [
        {
          id: 'STD0001',
          password: bcrypt.hashSync('AB12CD', 10),
          name: 'Ahmed Raza Saifee',
          age: 14,
          its: '30123456',
          mobile: '9876543210',
          fatherName: 'Mohammed Saifee',
          fatherIts: '30123457',
          motherName: 'Zainab Saifee',
          motherIts: '30123458',
          fatherMobile: '9876543211',
          motherMobile: '9876543212',
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
          status: 'active',
        },
        {
          id: 'STD0002',
          password: bcrypt.hashSync('XY98ZQ', 10),
          name: 'Yusuf Bhaisaheb',
          age: 12,
          its: '30187654',
          mobile: '9988776655',
          fatherName: 'Taher Bhaisaheb',
          fatherIts: '30187655',
          motherName: 'Fatema Bhaisaheb',
          motherIts: '30187656',
          fatherMobile: '9988776656',
          motherMobile: '9988776657',
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
          status: 'active',
        },
        {
          id: 'STD0003',
          password: bcrypt.hashSync('QW77ER', 10),
          name: 'Husain Najmuddin',
          age: 16,
          its: '30145678',
          mobile: '9123456780',
          fatherName: 'Najmuddin Ezzi',
          fatherIts: '30145679',
          motherName: 'Sakina Ezzi',
          motherIts: '30145680',
          fatherMobile: '9123456781',
          motherMobile: '9123456782',
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
          status: 'active',
        },
      ]

      const dbRows = demoStudents.map(studentToDatabase)

      const { error: insertError } = await supabase
        .from('students')
        .insert(dbRows)
      
      if (insertError) handleDbError(insertError, 'seeding demo data')
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'seeding demo data')
    }
  },

  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_date', { ascending: false })

      if (error) handleDbError(error, 'fetching all students')

      return (data as DatabaseStudent[]).map(databaseToStudent)
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'fetching all students')
    }
  },

  async getById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        handleDbError(error, 'fetching student by id')
      }

      return data ? databaseToStudent(data as DatabaseStudent) : null
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'fetching student by id')
    }
  },

  async authenticateStudent(id: string, password: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`id.eq.${id},its.eq.${id}`)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        handleDbError(error, 'authenticating student')
      }

      if (data) {
        const isValid = bcrypt.compareSync(password, data.password)
        if (isValid) {
          return databaseToStudent(data as DatabaseStudent)
        }
      }

      return null
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'authenticating student')
    }
  },

  async authenticateStaff(role: 'janab' | 'accounts', password: string): Promise<DatabaseStaff | null> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('role', role)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        handleDbError(error, 'authenticating staff')
      }

      if (data) {
        const isValid = bcrypt.compareSync(password, data.password)
        if (isValid) {
          return data as DatabaseStaff
        }
      }

      return null
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'authenticating staff')
    }
  },

  async updateStaffPassword(role: 'janab' | 'accounts', currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify current password first
      const { data, error: fetchError } = await supabase
        .from('staff')
        .select('password')
        .eq('role', role)
        .single()

      if (fetchError) {
        handleDbError(fetchError, 'fetching staff password')
      }

      if (!data) return false

      const isValid = bcrypt.compareSync(currentPassword, data.password)
      if (!isValid) {
        throw new Error('Incorrect current password')
      }

      const hashedNewPassword = bcrypt.hashSync(newPassword, 10)

      const { error: updateError } = await supabase
        .from('staff')
        .update({ password: hashedNewPassword })
        .eq('role', role)

      if (updateError) {
        handleDbError(updateError, 'updating staff password')
      }

      return true
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'updating staff password')
    }
  },

  async updateStudentPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('password')
        .eq('id', id)
        .single()

      if (fetchError) {
        handleDbError(fetchError, 'fetching student password')
      }

      if (!data) return false

      const isValid = bcrypt.compareSync(currentPassword, data.password)
      if (!isValid) {
        throw new Error('Incorrect current password')
      }

      const hashedNewPassword = bcrypt.hashSync(newPassword, 10)

      const { error: updateError } = await supabase
        .from('students')
        .update({ password: hashedNewPassword })
        .eq('id', id)

      if (updateError) {
        handleDbError(updateError, 'updating student password')
      }

      return true
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'updating student password')
    }
  },

  async register(input: RegistrationInput): Promise<Student> {
    try {
      const { data: existingIts, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('its', input.its)
        .maybeSingle()

      if (checkError) handleDbError(checkError, 'checking duplicate ITS')
      if (existingIts) throw new Error('Student with this ITS already exists')

      const { data: allIds, error: fetchError } = await supabase
        .from('students')
        .select('id')

      if (fetchError) handleDbError(fetchError, 'getting latest student id')

      let maxNum = 0
      if (allIds && allIds.length > 0) {
        for (const record of allIds) {
          const match = record.id.match(/\d+$/)
          if (match) {
            const num = parseInt(match[0], 10)
            if (num > maxNum) {
              maxNum = num
            }
          }
        }
      }

      const nextNum = maxNum + 1
      const nextId = `STD${String(nextNum).padStart(4, '0')}`

      const rawPassword = generatePassword()
      const hashedPassword = bcrypt.hashSync(rawPassword, 10)

      const studentData: Student = {
        id: nextId,
        password: hashedPassword,
        name: input.name,
        age: input.age,
        its: input.its,
        mobile: input.mobile,
        fatherName: input.fatherName,
        fatherIts: input.fatherIts,
        motherName: input.motherName,
        motherIts: input.motherIts,
        fatherMobile: input.fatherMobile,
        motherMobile: input.motherMobile,
        email: input.email,
        address: input.address,
        program: input.program,
        completedJuz: input.completedJuz,
        remarks: input.remarks || '',
        monthlyFee: MONTHLY_FEE,
        paidAmount: 0,
        dueAmount: 0,
        feeStatus: 'Paid',
        paymentHistory: [],
        createdDate: new Date().toISOString(),
        status: 'active',
      }

      const dbRow = studentToDatabase(studentData)

      const { data, error: insertError } = await supabase
        .from('students')
        .insert(dbRow)
        .select()
        .single()

      if (insertError) handleDbError(insertError, 'registering student')

      const now = new Date()

      // Determine active billing month/year using app_settings table
      let activeMonth = now.getMonth() + 1
      let activeYear = now.getFullYear()

      const { data: settings, error: fetchSettingsError } = await supabase
        .from('app_settings')
        .select('active_billing_month, active_billing_year')
        .eq('id', 1)
        .maybeSingle()

      if (fetchSettingsError) {
        console.error(fetchSettingsError)
        handleDbError(fetchSettingsError, 'fetching active billing month settings')
      }

      if (settings) {
        activeMonth = settings.active_billing_month
        activeYear = settings.active_billing_year
      } else {
        const { data: auth } = await supabase.auth.getUser();
        console.log({
          action: 'register',
          selectResult: settings,
          selectError: fetchSettingsError,
          authenticatedUser: auth,
        })
        throw new Error('ERP configuration missing')
      }

      // Ensure no duplicate fee record is created
      const { data: existingFee } = await supabase
        .from('fee_records')
        .select('id')
        .eq('student_id', data.id)
        .eq('billing_month', activeMonth)
        .eq('billing_year', activeYear)
        .maybeSingle()

      if (!existingFee) {
        let nextMonth = activeMonth
        let nextMonthYear = activeYear
        if (nextMonth > 11) {
          nextMonth = 0
          nextMonthYear++
        }
        const dueDate = new Date(nextMonthYear, nextMonth, 1)

        const feeRecord = {
          student_id: data.id,
          billing_month: activeMonth,
          billing_year: activeYear,
          billing_date: now.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          original_fee: studentData.monthlyFee,
          scholarship_amount: 0,
          amount: studentData.monthlyFee,
          paid_amount: 0,
          status: 'Pending',
          payment_date: null,
          payment_method: null,
          receipt_number: null,
          remarks: null
        }

        const { error: feeError } = await supabase
          .from('fee_records')
          .insert(feeRecord)

        if (feeError) {
          await supabase.from('students').delete().eq('id', data.id)
          handleDbError(feeError, 'creating initial fee record')
        }
      }

      const returnedStudent = databaseToStudent(data as DatabaseStudent)
      returnedStudent.password = rawPassword
      
      return returnedStudent
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'registering student')
    }
  },

  async updateStudent(id: string, patch: Partial<Student>): Promise<Student | null> {
    try {
      const student = await this.getById(id)
      if (!student) return null

      const updateData: Partial<DatabaseStudent> = {}

      let updatedMonthlyFee = student.monthlyFee
      let updatedPaidAmount = student.paidAmount

      if (patch.monthlyFee !== undefined && patch.monthlyFee !== student.monthlyFee) {
        updatedMonthlyFee = patch.monthlyFee
        updateData.monthly_fee = patch.monthlyFee
      }
      if (patch.paidAmount !== undefined && patch.paidAmount !== student.paidAmount) {
        updatedPaidAmount = patch.paidAmount
        updateData.paid_amount = patch.paidAmount
      }

      if (patch.monthlyFee !== undefined || patch.paidAmount !== undefined) {
        const dueAmount = Math.max(0, updatedMonthlyFee - updatedPaidAmount)
        const feeStatus = computeFeeStatus(updatedPaidAmount, dueAmount)
        
        if (dueAmount !== student.dueAmount) updateData.due_amount = dueAmount
        if (feeStatus !== student.feeStatus) updateData.fee_status = feeStatus
      }

      if (patch.name !== undefined && patch.name !== student.name) updateData.name = patch.name
      if (patch.age !== undefined && patch.age !== student.age) updateData.age = patch.age
      if (patch.its !== undefined && patch.its !== student.its) updateData.its = patch.its
      if (patch.mobile !== undefined && patch.mobile !== student.mobile) updateData.mobile = patch.mobile
      if (patch.fatherName !== undefined && patch.fatherName !== student.fatherName) updateData.father_name = patch.fatherName
      if (patch.fatherIts !== undefined && patch.fatherIts !== student.fatherIts) updateData.father_its = patch.fatherIts
      if (patch.motherName !== undefined && patch.motherName !== student.motherName) updateData.mother_name = patch.motherName
      if (patch.motherIts !== undefined && patch.motherIts !== student.motherIts) updateData.mother_its = patch.motherIts
      if (patch.fatherMobile !== undefined && patch.fatherMobile !== student.fatherMobile) updateData.father_mobile = patch.fatherMobile
      if (patch.motherMobile !== undefined && patch.motherMobile !== student.motherMobile) updateData.mother_mobile = patch.motherMobile
      if (patch.email !== undefined && patch.email !== student.email) updateData.email = patch.email
      if (patch.address !== undefined && patch.address !== student.address) updateData.address = patch.address
      if (patch.program !== undefined && patch.program !== student.program) updateData.program = patch.program
      if (patch.completedJuz !== undefined && patch.completedJuz !== student.completedJuz) updateData.completed_juz = patch.completedJuz
      if (patch.remarks !== undefined && patch.remarks !== student.remarks) updateData.remarks = patch.remarks
      if (patch.status !== undefined && patch.status !== student.status) updateData.status = patch.status
      if (patch.paymentHistory !== undefined && patch.paymentHistory !== student.paymentHistory) updateData.payment_history = patch.paymentHistory

      if (Object.keys(updateData).length === 0) {
        return student
      }

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) handleDbError(error, 'updating student')

      return databaseToStudent(data as DatabaseStudent)
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'updating student')
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      // Delete all related fee records first to avoid foreign key constraint errors
      const { error: feeError } = await supabase
        .from('fee_records')
        .delete()
        .eq('student_id', id)

      if (feeError) handleDbError(feeError, 'deleting student fee records')

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) handleDbError(error, 'deleting student')
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'deleting student')
    }
  },

  async recordPayment(id: string, amount: number, note?: string): Promise<Student | null> {
    try {
      if (amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      const student = await this.getById(id)
      if (!student) throw new Error('Student not found')

      const record: PaymentRecord = {
        id: `p${Date.now()}`,
        date: new Date().toISOString(),
        amount,
        note,
      }

      const paidAmount = Math.min(student.monthlyFee, student.paidAmount + amount)
      const dueAmount = Math.max(0, student.monthlyFee - paidAmount)
      const feeStatus = computeFeeStatus(paidAmount, dueAmount)
      const paymentHistory = [...student.paymentHistory, record]

      const updateData: Partial<DatabaseStudent> = {
        paid_amount: paidAmount,
        due_amount: dueAmount,
        fee_status: feeStatus,
        payment_history: paymentHistory,
      }

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) handleDbError(error, 'recording payment')

      return databaseToStudent(data as DatabaseStudent)
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'recording payment')
    }
  },

  async generateMonthlyFees(month?: number, year?: number): Promise<number> {
    try {
      const now = new Date()
      const currentMonth = month || now.getMonth() + 1
      const currentYear = year || now.getFullYear()
      
      // Update the existing row directly
      const result = await supabase
        .from('app_settings')
        .update({ 
          active_billing_month: currentMonth, 
          active_billing_year: currentYear, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', 1)
        .select()
        
      const { data: auth } = await supabase.auth.getUser();
      console.log({
        action: 'generateMonthlyFees',
        updateResult: result.data,
        updateError: result.error,
        authenticatedUser: auth,
        currentMonth,
        currentYear
      })
      
      if (result.error) {
        console.error(result.error)
        handleDbError(result.error, 'updating active billing month settings')
      }
      
      // If error is null, the update succeeded even if select() returned no rows
      if (result.error !== null) {
        throw new Error('ERP configuration missing')
      }

      let nextMonth = currentMonth
      let nextMonthYear = currentYear
      if (nextMonth > 11) {
        nextMonth = 0
        nextMonthYear++
      }
      const dueDate = new Date(nextMonthYear, nextMonth, 1)

      const { data: activeStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')

      if (studentsError) handleDbError(studentsError, 'fetching active students')
      if (!activeStudents || activeStudents.length === 0) return 0

      const { data: existingRecords, error: fetchError } = await supabase
        .from('fee_records')
        .select('student_id')
        .eq('billing_month', currentMonth)
        .eq('billing_year', currentYear)

      if (fetchError) handleDbError(fetchError, 'fetching existing fee records')

      const existingStudentIds = new Set((existingRecords || []).map(r => r.student_id))
      const recordsToInsert = []

      for (const student of activeStudents) {
        if (existingStudentIds.has(student.id)) continue

        recordsToInsert.push({
          student_id: student.id,
          billing_month: currentMonth,
          billing_year: currentYear,
          billing_date: now.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          original_fee: student.monthly_fee,
          scholarship_amount: 0,
          amount: student.monthly_fee,
          paid_amount: 0,
          status: 'Pending',
          payment_date: null,
          payment_method: null,
          receipt_number: null,
          remarks: null
        })
      }

      if (recordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('fee_records')
          .insert(recordsToInsert)
        
        if (insertError) handleDbError(insertError, 'generating monthly fees')
      }

      return recordsToInsert.length
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'generating monthly fees')
      return 0
    }
  },

  async getAccountsDataByMonth(month: number, year: number): Promise<FeeRecord[]> {
    try {
      const { data: currentRecords, error: currentError } = await supabase
        .from('fee_records')
        .select(`
          *,
          students (
            id,
            name,
            its
          )
        `)
        .eq('billing_month', month)
        .eq('billing_year', year)

      if (currentError) handleDbError(currentError, 'fetching current month fee records')

      const { data: historicalRecords, error: historicalError } = await supabase
        .from('fee_records')
        .select(`
          *,
          students (
            id,
            name,
            its
          )
        `)
        .in('status', ['Pending', 'Partially Paid'])
        .or(`billing_year.lt.${year},and(billing_year.eq.${year},billing_month.lt.${month})`)
        .order('billing_year', { ascending: true })
        .order('billing_month', { ascending: true })

      if (historicalError) handleDbError(historicalError, 'fetching historical fee records')

      const historicalByStudent: Record<string, any[]> = {}
      if (historicalRecords) {
        for (const hr of historicalRecords) {
          if (!historicalByStudent[hr.student_id]) {
            historicalByStudent[hr.student_id] = []
          }
          historicalByStudent[hr.student_id].push(hr)
        }
      }

      const mapToFeeRecord = (r: any): FeeRecord => ({
        id: r.id,
        studentId: r.student_id,
        studentName: (Array.isArray(r.students) ? r.students[0]?.name : r.students?.name) || '',
        studentIts: (Array.isArray(r.students) ? r.students[0]?.its : r.students?.its) || '',
        billingMonth: r.billing_month,
        billingYear: r.billing_year,
        billingDate: r.billing_date,
        dueDate: r.due_date,
        originalFee: r.original_fee || 0,
        scholarshipAmount: r.scholarship_amount || 0,
        amount: r.amount,
        paidAmount: r.paid_amount,
        status: r.status,
        paymentDate: r.payment_date,
        paymentMethod: r.payment_method,
        receiptNumber: r.receipt_number,
        remarks: r.remarks,
        outstandingBalance: 0,
        outstandingRecords: []
      })

      const result: FeeRecord[] = []
      for (const cr of (currentRecords || [])) {
        const feeRec = mapToFeeRecord(cr)
        
        const history = historicalByStudent[cr.student_id] || []
        let outstandingBalance = 0
        const outstandingRecords: FeeRecord[] = []

        for (const hr of history) {
          outstandingBalance += Math.max(0, hr.amount - hr.paid_amount)
          outstandingRecords.push(mapToFeeRecord(hr))
        }

        feeRec.outstandingBalance = outstandingBalance
        feeRec.outstandingRecords = outstandingRecords
        result.push(feeRec)
      }

      return result
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'fetching accounts data')
      return []
    }
  },

  async processPayment(studentId: string, paymentAmount: number, paymentMethod: string): Promise<PaymentResult> {
    try {
      if (paymentAmount <= 0) throw new Error('Payment amount must be greater than 0')

      const { data: unpaidRecords, error: fetchError } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['Pending', 'Partially Paid'])
        .order('billing_year', { ascending: true })
        .order('billing_month', { ascending: true })

      if (fetchError) handleDbError(fetchError, 'fetching unpaid fee records')
      if (!unpaidRecords || unpaidRecords.length === 0) {
        throw new Error('No outstanding fee records found for this student.')
      }

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      
      let remainingAmount = paymentAmount
      const updatedRecords: PaymentResultRecord[] = []
      let recordsUpdated = 0
      const nowStr = new Date().toISOString().split('T')[0]

      for (const record of unpaidRecords) {
        if (remainingAmount <= 0) break

        const { data: latestRecord, error: latestError } = await supabase
          .from('fee_records')
          .select('paid_amount, amount, status')
          .eq('id', record.id)
          .single()

        if (latestError) handleDbError(latestError, 'verifying fee record state')
        if (!latestRecord || latestRecord.paid_amount !== record.paid_amount || latestRecord.status !== record.status) {
          throw new Error('This fee record has already been updated. Please refresh and try again.')
        }

        const dueForRecord = Math.max(0, record.amount - record.paid_amount)
        if (dueForRecord <= 0) continue

        const amountToApply = Math.min(remainingAmount, dueForRecord)
        const newPaidAmount = record.paid_amount + amountToApply
        
        if (newPaidAmount > record.amount) {
          throw new Error('Paid amount cannot exceed total amount.')
        }

        const newStatus = newPaidAmount >= record.amount ? 'Paid' : 'Partially Paid'
        
        const { error: updateError } = await supabase
          .from('fee_records')
          .update({
            paid_amount: newPaidAmount,
            status: newStatus,
            payment_date: nowStr,
            payment_method: paymentMethod
          })
          .eq('id', record.id)

        if (updateError) {
          throw new Error(`Failed to update fee record for ${monthNames[record.billing_month - 1]} ${record.billing_year}. Process halted.`)
        }

        remainingAmount -= amountToApply
        recordsUpdated++

        updatedRecords.push({
          billingMonth: record.billing_month,
          billingYear: record.billing_year,
          monthLabel: `${monthNames[record.billing_month - 1]} ${record.billing_year}`,
          amountApplied: amountToApply,
          remainingDue: Math.max(0, record.amount - newPaidAmount),
          status: newStatus
        })
      }

      return {
        success: true,
        paymentApplied: paymentAmount - remainingAmount,
        recordsUpdated,
        remainingAmount,
        updatedRecords
      }
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'processing payment')
      throw err 
    }
  },

  async updateMonthlyFeeDetails(
    recordId: string, 
    originalFee: number, 
    scholarshipAmount: number, 
    isSkipped: boolean
  ): Promise<void> {
    try {
      if (scholarshipAmount < 0 || scholarshipAmount > originalFee) {
        throw new Error('Scholarship amount must be between 0 and original fee')
      }

      const { data: record, error: fetchError } = await supabase
        .from('fee_records')
        .select('paid_amount')
        .eq('id', recordId)
        .single()
      
      if (fetchError || !record) handleDbError(fetchError || new Error('Record not found'), 'fetching record')

      let newScholarship = scholarshipAmount
      let newAmount = originalFee - newScholarship
      let newStatus = 'Pending'

      if (isSkipped) {
        newScholarship = originalFee
        newAmount = 0
        newStatus = 'Skipped'
      } else {
        if (newAmount < record.paid_amount) {
          throw new Error('Cannot reduce payable amount below already paid amount')
        }
        
        if (newAmount === 0) {
          newStatus = record.paid_amount > 0 ? 'Paid' : 'Pending'
          if (newAmount === record.paid_amount) newStatus = 'Paid'
        } else {
          newStatus = record.paid_amount >= newAmount ? 'Paid' : record.paid_amount > 0 ? 'Partially Paid' : 'Pending'
        }
      }

      const { error: updateError } = await supabase
        .from('fee_records')
        .update({
          original_fee: originalFee,
          scholarship_amount: newScholarship,
          amount: newAmount,
          status: newStatus
        })
        .eq('id', recordId)

      if (updateError) handleDbError(updateError, 'updating fee record')
    } catch (err) {
      if (err instanceof Error) throw err
      handleDbError(err, 'updating fee record')
      throw err
    }
  },
}
