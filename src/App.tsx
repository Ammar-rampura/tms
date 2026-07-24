import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Login } from '@/pages/Login'
import { StudentRegister } from '@/pages/StudentRegister'
import { StudentDashboard } from '@/pages/StudentDashboard'
import { JanabLayout } from '@/pages/janab/JanabLayout'
import { JanabOverview } from '@/pages/janab/JanabOverview'
import { JanabStudents } from '@/pages/janab/JanabStudents'
import { JanabStudentProfile } from '@/pages/janab/JanabStudentProfile'
import { AccountsLayout } from '@/pages/accounts/AccountsLayout'
import { AccountsOverview } from '@/pages/accounts/AccountsOverview'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<StudentRegister />} />

        <Route element={<ProtectedRoute allow={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allow={['janab']} />}>
          <Route path="/janab" element={<JanabLayout />}>
            <Route index element={<JanabOverview />} />
            <Route path="students" element={<JanabStudents />} />
            <Route path="students/:id" element={<JanabStudentProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['accounts']} />}>
          <Route path="/accounts" element={<AccountsLayout />}>
            <Route index element={<AccountsOverview />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
