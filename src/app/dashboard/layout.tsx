import NavBar from '@/components/layout/NavBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <NavBar />
    </div>
  )
}
