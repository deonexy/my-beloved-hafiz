'use client'

import { useEffect, useState } from 'react'
import { getOrCreateStats } from '@/lib/db'
import { ALL_BADGES, levelFromXp, xpToNextLevel } from '@/lib/gamification'
import type { UserStats } from '@/types'
import XPBar from '@/components/gamification/XPBar'

export default function ProfilPage() {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    getOrCreateStats().then(setStats)
  }, [])

  if (!stats) return null

  const level = levelFromXp(stats.totalXp)
  const xp = xpToNextLevel(stats.totalXp)

  return (
    <div className="px-4 pt-6 max-w-md mx-auto space-y-5 pb-8">
      {/* Profile header */}
      <div className="card px-5 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-400/20 border-2 border-gold-400/40 flex items-center justify-center text-2xl mx-auto mb-3">
          📿
        </div>
        <div className="text-white font-semibold text-lg">Level {level} — Hafiz</div>
        <div className="text-white/40 text-sm mb-4">{stats.totalXp.toLocaleString('id')} XP total</div>
        <XPBar progress={xp.progress} />
        <div className="text-white/30 text-xs mt-2">
          {xp.current.toLocaleString('id')} / {xp.needed.toLocaleString('id')} XP ke level berikutnya
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Streak', value: `${stats.streakDays} hari`, icon: '🔥' },
          { label: 'Terpanjang', value: `${stats.longestStreak} hari`, icon: '⚡' },
          { label: 'Ayat Hafal', value: stats.totalAyatHafal.toString(), icon: '📖' },
          { label: 'Ayat Mutqin', value: stats.totalAyatMutqin.toString(), icon: '💎' },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-4">
            <span className="text-xl">{s.icon}</span>
            <div className="text-white font-bold text-xl mt-2">{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card px-5 py-5">
        <h2 className="text-white font-medium text-sm mb-4">Pencapaian</h2>
        <div className="grid grid-cols-3 gap-3">
          {ALL_BADGES.map((badge) => {
            const unlocked = badge.unlockedAt !== null
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-opacity ${
                  unlocked ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{badge.icon}</span>
                <span className="text-white/70 text-xs leading-tight">{badge.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sign out placeholder */}
      <button className="btn-ghost w-full text-center text-red-400/60 hover:text-red-400">
        Keluar
      </button>
    </div>
  )
}
