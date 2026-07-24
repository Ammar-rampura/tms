import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/types'
import { db } from '@/lib/db'

const SESSION_KEY = 'tehfiz_session_v1'

// Demo staff credentials, as specified in the product brief.
const STAFF_CREDENTIALS: Record<string, { password: string; name: string }> = {
  janab: { password: 'janab123', name: 'Janab (Super Admin)' },
  accounts: { password: 'accounts123', name: 'Accounts Office' },
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  loginStaff: (role: 'janab' | 'accounts', username: string, password: string) => Promise<boolean>
  loginStudent: (studentId: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        // ignore corrupted session
      }
    }
    setLoading(false)
  }, [])

  function persist(next: AuthUser | null) {
    setUser(next)
    if (next) sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else sessionStorage.removeItem(SESSION_KEY)
  }

  async function loginStaff(role: 'janab' | 'accounts', username: string, password: string) {
    const record = STAFF_CREDENTIALS[role]
    if (!record) return false
    if (username.trim().toLowerCase() !== role || password !== record.password) return false
    persist({ role, id: role, name: record.name })
    return true
  }

  async function loginStudent(studentId: string, password: string) {
    const student = await db.authenticateStudent(studentId, password)
    if (!student) return false
    persist({ role: 'student', id: student.id, name: student.name })
    return true
  }

  function logout() {
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginStaff, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
