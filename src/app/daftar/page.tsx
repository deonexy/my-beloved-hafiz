'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function DaftarPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Akun dibuat! Cek email untuk verifikasi.')
      router.push('/masuk')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="arabic text-gold-400 text-center mb-2">حافظ</div>
        <h1 className="text-white text-xl font-semibold text-center mb-8">Buat Akun</h1>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Nama" type="text" value={name} onChange={setName} placeholder="Nama kamu" />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="email@kamu.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 karakter" />

          <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
            {loading ? 'Mendaftar…' : 'Buat Akun'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="text-gold-400 hover:underline">Masuk</Link>
        </p>
      </div>
    </main>
  )
}

function Input({
  label, type, value, onChange, placeholder,
}: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div>
      <label className="text-white/50 text-xs mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3
                   text-white placeholder-white/20 text-sm
                   focus:outline-none focus:border-gold-400/50
                   transition-colors"
      />
    </div>
  )
}
