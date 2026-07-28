import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { BottomNav } from '@/components/BottomNav'

export function AccountsLayout() {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-primary-900">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title="Accounts Panel" subtitle="Offline fee collection & payment tracking" />
        <main className="flex-1 px-5 py-6 pb-24 md:px-8 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
