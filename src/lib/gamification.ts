import { XP_TABLE, LEVEL_THRESHOLDS } from '@/types'
import type { Badge, UserStats, PracticeMode } from '@/types'

export function xpForAction(
  action: keyof typeof XP_TABLE,
  multiplier = 1,
): number {
  return Math.round(XP_TABLE[action] * multiplier)
}

export function levelFromXp(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function xpToNextLevel(totalXp: number): {
  current: number
  needed: number
  progress: number // 0-1
} {
  const level = levelFromXp(totalXp)
  const levelIdx = level - 1
  const currentFloor = LEVEL_THRESHOLDS[levelIdx] ?? 0
  const nextCeiling = LEVEL_THRESHOLDS[levelIdx + 1] ?? LEVEL_THRESHOLDS[levelIdx] + 1000
  const current = totalXp - currentFloor
  const needed = nextCeiling - currentFloor
  return { current, needed, progress: current / needed }
}

export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0
  if (streakDays >= 14) return 1.5
  if (streakDays >= 7)  return 1.25
  return 1.0
}

export function checkStreakUpdate(stats: UserStats): Partial<UserStats> {
  const today = new Date().toISOString().slice(0, 10)
  const lastActive = stats.lastActiveDate

  if (lastActive === today) return {}

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const isConsecutive = lastActive === yesterday

  const newStreak = isConsecutive ? stats.streakDays + 1 : 1
  return {
    streakDays: newStreak,
    longestStreak: Math.max(newStreak, stats.longestStreak),
    lastActiveDate: today,
  }
}

// ─── Badges definition ───────────────────────────────────────────────────────

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_ayat',
    name: 'Langkah Pertama',
    description: 'Hafal ayat pertamamu',
    icon: '🌱',
    unlockedAt: null,
    condition: { type: 'ayat_count', value: 1 },
  },
  {
    id: 'juz_30',
    name: 'Juz Amma',
    description: 'Selesaikan Juz 30',
    icon: '📖',
    unlockedAt: null,
    condition: { type: 'surah_complete', value: 37 }, // 37 surah in juz 30
  },
  {
    id: 'streak_7',
    name: 'Seminggu Istiqomah',
    description: 'Streak 7 hari berturut-turut',
    icon: '🔥',
    unlockedAt: null,
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Satu Bulan Istiqomah',
    description: 'Streak 30 hari berturut-turut',
    icon: '⚡',
    unlockedAt: null,
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'mutqin_100',
    name: 'Hafiz Sejati',
    description: '100 ayat mutqin',
    icon: '🏆',
    unlockedAt: null,
    condition: { type: 'ayat_count', value: 100 },
  },
  {
    id: 'xp_1000',
    name: 'Pejuang Ilmu',
    description: 'Kumpulkan 1.000 XP',
    icon: '⭐',
    unlockedAt: null,
    condition: { type: 'xp', value: 1000 },
  },
]

export function checkNewBadges(
  stats: UserStats,
  earnedBadgeIds: string[],
): Badge[] {
  return ALL_BADGES.filter((badge) => {
    if (earnedBadgeIds.includes(badge.id)) return false

    const { type, value } = badge.condition
    switch (type) {
      case 'ayat_count':    return stats.totalAyatHafal >= value
      case 'streak':        return stats.streakDays >= value
      case 'surah_complete':return stats.totalSurahComplete >= value
      case 'xp':            return stats.totalXp >= value
      default:              return false
    }
  })
}
