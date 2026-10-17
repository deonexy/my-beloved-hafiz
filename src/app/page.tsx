/**
 * Landing / home — shown before auth.
 * After login, redirects to /dashboard.
 */
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="text-center max-w-md mx-auto">
        {/* Arabic name — the visual anchor */}
        <div className="arabic-lg text-gold-400 mb-2 select-none">
          حافظ
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Hafalan Al-Quran<br />
          <span className="text-white/50 font-normal text-xl">yang terstruktur & terukur</span>
        </h1>
        <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs mx-auto">
          Spaced repetition, gamifikasi, dan target harian — dirancang agar
          kamu khatam dalam 3–5 tahun dengan hafalan yang mutqin.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3 items-center">
          <Link href="/daftar" className="btn-gold w-full max-w-xs text-center">
            Mulai Hafalan
          </Link>
          <Link href="/masuk" className="btn-ghost w-full max-w-xs text-center">
            Sudah punya akun
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-20 grid grid-cols-1 gap-4 w-full max-w-md">
        {[
          { icon: '🎯', title: 'Target jelas', desc: 'Ayat harian dihitung otomatis dari targetmu — 3 atau 5 tahun.' },
          { icon: '🔁', title: 'Spaced repetition', desc: 'Jadwal ulang pintar: review ayat tepat saat kamu hampir lupa.' },
          { icon: '🏆', title: 'Gamifikasi', desc: 'XP, streak, level, dan badge yang membuatmu semangat tiap hari.' },
          { icon: '📴', title: 'Offline-ready', desc: 'Latihan berjalan tanpa internet. Data tersinkron saat online.' },
        ].map((f) => (
          <div key={f.icon} className="card flex items-start gap-4 px-5 py-4">
            <span className="text-2xl mt-0.5 shrink-0">{f.icon}</span>
            <div>
              <div className="text-white font-medium text-sm mb-0.5">{f.title}</div>
              <div className="text-white/50 text-sm leading-relaxed">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Version stamp */}
      <p className="mt-12 text-white/20 text-xs">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </p>
    </main>
  )
}
