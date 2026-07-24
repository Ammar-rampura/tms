import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

export function AccountsLayout() {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-primary-900">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title="Accounts Panel" subtitle="Offline fee collection & payment tracking" />
        <main className="flex-1 px-5 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
