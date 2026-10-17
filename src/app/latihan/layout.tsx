import NavBar from '@/components/layout/NavBar'

export default function LatihanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <NavBar />
    </div>
  )
}
