'use client'

import { useEffect, useState } from 'react'
import { getOrCreateStats, getAyatDueForReview } from '@/lib/db'
import { levelFromXp, xpToNextLevel, streakMultiplier } from '@/lib/gamification'
import type { UserStats, AyatProgress } from '@/types'
import XPBar from '@/components/gamification/XPBar'
import StreakBadge from '@/components/gamification/StreakBadge'
import DailyTargetCard from '@/components/hafalan/DailyTargetCard'
import ReviewQueue from '@/components/hafalan/ReviewQueue'
import QuickActions from '@/components/hafalan/QuickActions'

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [dueReviews, setDueReviews] = useState<AyatProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [s, reviews] = await Promise.all([
        getOrCreateStats(),
        getAyatDueForReview(10),
      ])
      setStats(s)
      setDueReviews(reviews)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />

  const level = levelFromXp(stats!.totalXp)
  const xp = xpToNextLevel(stats!.totalXp)
  const multi = streakMultiplier(stats!.streakDays)

  return (
    <div className="px-4 pt-6 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs mb-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-white text-lg font-semibold">Assalamu&apos;alaikum</h1>
        </div>
        <StreakBadge streak={stats!.streakDays} multiplier={multi} />
      </div>

      {/* Level + XP */}
      <div className="card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm">Level {level}</span>
          <span className="text-gold-400 text-xs font-medium">
            {xp.current.toLocaleString('id')} / {xp.needed.toLocaleString('id')} XP
          </span>
        </div>
        <XPBar progress={xp.progress} from={0} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <StatPill label="Total XP" value={stats!.totalXp.toLocaleString('id')} />
          <StatPill label="Ayat Hafal" value={stats!.totalAyatHafal.toString()} />
          <StatPill label="Mutqin" value={stats!.totalAyatMutqin.toString()} />
        </div>
      </div>

      {/* Daily target */}
      <DailyTargetCard />

      {/* Review queue */}
      {dueReviews.length > 0 && (
        <ReviewQueue reviews={dueReviews} />
      )}

      {/* Quick actions */}
      <QuickActions />
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-700/60 rounded-xl py-2.5 px-2">
      <div className="text-white font-semibold text-base">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="px-4 pt-6 max-w-md mx-auto space-y-5">
      {[72, 112, 80, 96].map((h) => (
        <div key={h} className={`skeleton rounded-2xl`} style={{ height: h }} />
      ))}
    </div>
  )
}
