import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

export function JanabLayout() {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-primary-900">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title="Janab Panel" subtitle="Complete oversight of Tahfeez operations" />
        <main className="flex-1 px-5 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
