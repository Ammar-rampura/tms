import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Login } from '@/pages/Login'
import { StudentRegister } from '@/pages/StudentRegister'
import { StudentDashboard } from '@/pages/StudentDashboard'
import { JanabLayout } from '@/pages/janab/JanabLayout'
import { JanabOverview } from '@/pages/janab/JanabOverview'
import { JanabStudents } from '@/pages/janab/JanabStudents'
import { JanabStudentProfile } from '@/pages/janab/JanabStudentProfile'
import { JanabFees } from '@/pages/janab/JanabFees'
import { JanabLeaderboard } from '@/pages/janab/JanabLeaderboard'
import { AccountsLayout } from '@/pages/accounts/AccountsLayout'
import { AccountsOverview } from '@/pages/accounts/AccountsOverview'
import { MusaedenRegister } from '@/pages/musaeden/MusaedenRegister'
import { MusaedenDashboard } from '@/pages/musaeden/MusaedenDashboard'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/musaeden/register" element={<MusaedenRegister />} />

        {/* Student Portal */}
        <Route element={<ProtectedRoute allow={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* Musaeden Portal (Quran Listeners) */}
        <Route element={<ProtectedRoute allow={['musaeden']} />}>
          <Route path="/musaeden" element={<MusaedenDashboard />} />
        </Route>

        {/* Janab Super Admin Portal */}
        <Route element={<ProtectedRoute allow={['janab']} />}>
          <Route path="/janab" element={<JanabLayout />}>
            <Route index element={<JanabOverview />} />
            <Route path="students" element={<JanabStudents />} />
            <Route path="students/:id" element={<JanabStudentProfile />} />
            <Route path="fees" element={<JanabFees />} />
            <Route path="leaderboard" element={<JanabLeaderboard />} />
          </Route>
        </Route>

        {/* Accounts Office Portal */}
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
