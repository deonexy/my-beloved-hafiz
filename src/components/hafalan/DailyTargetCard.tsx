'use client'

import { useEffect, useState } from 'react'
import { getDB } from '@/lib/db'
import { calcDailyTarget } from '@/lib/spaced-repetition'
import type { HafalanTarget } from '@/types'
import Link from 'next/link'

export default function DailyTargetCard() {
  const [target, setTarget] = useState<HafalanTarget | null>(null)
  const [hafalToday, setHafalToday] = useState(0)

  useEffect(() => {
    async function load() {
      const db = getDB()
      const activeTarget = await db.hafalanTarget
        .filter((t) => t.isActive)
        .first()
      setTarget(activeTarget ?? null)

      if (activeTarget) {
        const today = new Date().toISOString().slice(0, 10)
        const sessions = await db.practiceSessions
          .filter((s) =>
            s.completedAt.startsWith(today) &&
            (s.mode === 'baca' || s.mode === 'tulis'),
          )
          .count()
        setHafalToday(sessions)
      }
    }
    load()
  }, [])

  if (!target) {
    return (
      <div className="card-gold px-5 py-5">
        <p className="text-white/50 text-sm mb-3">Belum ada target hafalan.</p>
        <Link href="/target/baru" className="btn-gold text-sm">
          Buat Target Sekarang
        </Link>
      </div>
    )
  }

  const { dailyNew, dailyReview } = calcDailyTarget(
    target.targetYears,
    0, // TODO: from stats
  )
  const dailyTotal = dailyNew + dailyReview
  const progress = Math.min(hafalToday / dailyTotal, 1)

  const daysLeft = Math.ceil(
    (new Date(target.targetDate).getTime() - Date.now()) / 86_400_000,
  )

  return (
    <div className="card-gold px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-medium text-sm">Target Hari Ini</h2>
        <span className="text-white/40 text-xs">{daysLeft} hari lagi</span>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-5">
        <CircleProgress progress={progress} size={72} />
        <div className="flex-1 space-y-2">
          <TargetRow label="Hafalan baru" done={Math.min(hafalToday, dailyNew)} total={dailyNew} />
          <TargetRow label="Muraja'ah" done={0} total={dailyReview} />
        </div>
      </div>
    </div>
  )
}

function TargetRow({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total > 0 ? done / total : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className={done >= total ? 'text-jade-400' : 'text-white/40'}>
          {done}/{total} ayat
        </span>
      </div>
      <div className="progress-bar h-1.5">
        <div className="progress-fill" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  )
}

function CircleProgress({ progress, size }: { progress: number; size: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  const pct = Math.round(progress * 100)

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1B3558" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={pct >= 100 ? '#4DB88A' : '#C9A84C'}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={13} fontWeight={600}
        className="rotate-90"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {pct}%
      </text>
    </svg>
  )
}
