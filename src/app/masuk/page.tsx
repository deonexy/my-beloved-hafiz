'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function MasukPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email atau password salah')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="arabic text-gold-400 text-center mb-2">حافظ</div>
        <h1 className="text-white text-xl font-semibold text-center mb-8">Masuk</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com" required
              className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3
                         text-white placeholder-white/20 text-sm
                         focus:outline-none focus:border-gold-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3
                         text-white placeholder-white/20 text-sm
                         focus:outline-none focus:border-gold-400/50 transition-colors"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
            {loading ? 'Masuk…' : 'Masuk'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-gold-400 hover:underline">Daftar</Link>
        </p>
      </div>
    </main>
  )
}
