import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Hafiz — Hafalan Al-Quran',
  description: 'Aplikasi hafalan Al-Quran dengan metode spaced repetition, target 3–5 tahun khatam.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Hafiz' },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D1B2A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-navy-900 text-white antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#1a2d42', color: '#fff', border: '1px solid rgba(212,175,55,0.2)' },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
