import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
