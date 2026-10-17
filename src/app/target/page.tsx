'use client'

import { useEffect, useState } from 'react'
import { getDB } from '@/lib/db'
import { calcDailyTarget } from '@/lib/spaced-repetition'
import type { HafalanTarget } from '@/types'
import Link from 'next/link'
import { Target, Calendar, Zap } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function TargetPage() {
  const [target, setTarget] = useState<HafalanTarget | null | undefined>(undefined)

  useEffect(() => {
    const db = getDB()
    db.hafalanTarget.filter((t) => t.isActive).first().then(setTarget)
  }, [])

  if (target === undefined) return <div className="p-6"><div className="skeleton h-40 rounded-2xl" /></div>

  if (!target) {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto">
        <h1 className="text-white text-xl font-semibold mb-2">Target Hafalan</h1>
        <p className="text-white/50 text-sm mb-8">
          Tentukan berapa tahun kamu ingin khatam Al-Quran, dan kami hitung target harian otomatis.
        </p>
        <TargetSetupForm onSave={setTarget} />
      </div>
    )
  }

  const { dailyNew, dailyReview } = calcDailyTarget(target.targetYears, 0)
  const daysLeft = Math.ceil((new Date(target.targetDate).getTime() - Date.now()) / 86_400_000)

  return (
    <div className="px-4 pt-6 max-w-md mx-auto space-y-5">
      <h1 className="text-white text-xl font-semibold">Target Hafalan</h1>

      {/* Target summary */}
      <div className="card-gold px-5 py-5">
        <div className="flex items-start gap-3 mb-5">
          <Target size={20} className="text-gold-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-white font-medium">Khatam {target.targetYears} Tahun</div>
            <div className="text-white/50 text-sm">
              Mulai {format(new Date(target.startDate), 'd MMMM yyyy', { locale: idLocale })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoBox icon={<Calendar size={16} />} label="Selesai" value={
            format(new Date(target.targetDate), 'd MMM yyyy', { locale: idLocale })
          } />
          <InfoBox icon={<Zap size={16} />} label="Sisa" value={`${daysLeft} hari`} />
          <InfoBox icon="📖" label="Hafal/hari" value={`${dailyNew} ayat`} />
          <InfoBox icon="🔁" label="Review/hari" value={`${dailyReview} ayat`} />
        </div>
      </div>

      {/* Progress by juz */}
      <div className="card px-5 py-4">
        <h2 className="text-white font-medium text-sm mb-4">Progress per Juz</h2>
        <div className="space-y-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <div key={juz} className="flex items-center gap-3">
              <span className="text-white/30 text-xs w-6 shrink-0">{juz}</span>
              <div className="progress-bar flex-1 h-1.5">
                <div className="progress-fill" style={{ width: '0%' }} />
              </div>
              <span className="text-white/30 text-xs w-6 text-right shrink-0">0%</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={async () => {
          const db = getDB()
          await db.hafalanTarget.update(target.id!, { isActive: false })
          setTarget(null)
        }}
        className="btn-ghost w-full text-center text-red-400/70 hover:text-red-400"
      >
        Reset Target
      </button>
    </div>
  )
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode | string; label: string; value: string }) {
  return (
    <div className="bg-navy-700/60 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white/50 text-sm">{icon}</span>
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <div className="text-white font-semibold text-sm">{value}</div>
    </div>
  )
}

function TargetSetupForm({ onSave }: { onSave: (t: HafalanTarget) => void }) {
  const [years, setYears] = useState<3 | 5>(3)
  const [saving, setSaving] = useState(false)
  const { dailyNew, dailyReview } = calcDailyTarget(years, 0)

  async function handleSave() {
    setSaving(true)
    const db = getDB()
    const startDate = new Date().toISOString().slice(0, 10)
    const targetDate = new Date(Date.now() + years * 365 * 86_400_000).toISOString().slice(0, 10)
    const t: HafalanTarget = {
      targetYears: years,
      startDate,
      targetDate,
      dailyAyatTarget: dailyNew,
      weeklyReviewTarget: dailyReview * 7,
      currentPhase: 'new',
      isActive: true,
    }
    const id = await db.hafalanTarget.add(t)
    onSave({ ...t, id })
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {([3, 5] as const).map((y) => (
          <button
            key={y}
            onClick={() => setYears(y)}
            className={`card-gold px-5 py-5 text-left transition-all ${
              years === y ? 'border-gold-400/60 bg-gold-400/10' : ''
            }`}
          >
            <div className="text-gold-400 text-2xl font-bold mb-1">{y}</div>
            <div className="text-white text-sm font-medium mb-2">tahun</div>
            <div className="text-white/40 text-xs">
              ~{calcDailyTarget(y, 0).dailyNew} ayat/hari
            </div>
          </button>
        ))}
      </div>

      <div className="card px-5 py-4 space-y-2">
        <div className="text-white/50 text-xs mb-1">Estimasi rutinitas harian</div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Hafal baru</span>
          <span className="text-white font-medium">{dailyNew} ayat</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Muraja&apos;ah</span>
          <span className="text-white font-medium">{dailyReview} ayat</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-white/[0.06]">
          <span className="text-white/60">Total/hari</span>
          <span className="text-gold-400 font-semibold">{dailyNew + dailyReview} ayat</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-gold w-full"
      >
        {saving ? 'Menyimpan…' : `Mulai Target ${years} Tahun`}
      </button>
    </div>
  )
}
