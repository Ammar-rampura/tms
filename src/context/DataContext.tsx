import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { RegistrationInput, Student } from '@/types'
import { db } from '@/lib/db'

interface DataContextValue {
  students: Student[]
  loading: boolean
  refresh: () => Promise<void>
  register: (input: RegistrationInput) => Promise<Student>
  updateStudent: (id: string, patch: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  recordPayment: (id: string, amount: number, note?: string) => Promise<void>
  monthlyFee: number
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    await db.seedIfEmpty()
    const all = await db.getAll()
    setStudents(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Keep tabs/panels in sync if storage changes elsewhere.
  useEffect(() => {
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const register = useCallback(async (input: RegistrationInput) => {
    const student = await db.register(input)
    await refresh()
    return student
  }, [refresh])

  const updateStudent = useCallback(async (id: string, patch: Partial<Student>) => {
    await db.updateStudent(id, patch)
    await refresh()
  }, [refresh])

  const deleteStudent = useCallback(async (id: string) => {
    await db.deleteStudent(id)
    await refresh()
  }, [refresh])

  const recordPayment = useCallback(async (id: string, amount: number, note?: string) => {
    await db.recordPayment(id, amount, note)
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ students, loading, refresh, register, updateStudent, deleteStudent, recordPayment, monthlyFee: db.MONTHLY_FEE }),
    [students, loading, refresh, register, updateStudent, deleteStudent, recordPayment],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
