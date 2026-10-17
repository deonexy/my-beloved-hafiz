// ─── Quran Data ─────────────────────────────────────────────────────────────

export interface Surah {
  number: number
  name: string           // Arabic name
  nameId: string         // Indonesian name
  totalAyat: number
  juz: number[]          // which juz(s) this surah spans
  revelation: 'Makkiyyah' | 'Madaniyyah'
}

export interface Ayat {
  surahNumber: number
  ayatNumber: number
  arabic: string
  translation: string    // Indonesian
  transliteration: string
  juz: number
  page: number
}

// ─── Progress & Hafalan ──────────────────────────────────────────────────────

export type PracticeMode = 'baca' | 'tulis' | 'kata' | 'terjemah'

export type AyatStatus =
  | 'belum'      // not started
  | 'belajar'    // in progress
  | 'hafal'      // memorized
  | 'mutqin'     // firmly memorized (tested multiple times)

export interface AyatProgress {
  id?: number           // Dexie autoincrement
  surahNumber: number
  ayatNumber: number
  status: AyatStatus
  reviewCount: number
  correctStreak: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
  xpEarned: number
  syncedAt: string | null
  updatedAt: string
}

export interface PracticeSession {
  id?: number
  mode: PracticeMode
  surahNumber: number
  ayatStart: number
  ayatEnd: number
  score: number          // 0-100
  durationSeconds: number
  xpEarned: number
  completedAt: string
  synced: boolean
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface UserStats {
  id?: number
  totalXp: number
  level: number
  streakDays: number
  lastActiveDate: string | null
  totalAyatHafal: number
  totalAyatMutqin: number
  totalSurahComplete: number
  longestStreak: number
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string | null
  condition: {
    type: 'ayat_count' | 'streak' | 'surah_complete' | 'xp' | 'practice_count'
    value: number
  }
}

// ─── Target Planning ─────────────────────────────────────────────────────────

export interface HafalanTarget {
  id?: number
  targetYears: number      // 3 or 5
  startDate: string
  targetDate: string
  dailyAyatTarget: number
  weeklyReviewTarget: number // ayat to review per week
  currentPhase: 'new' | 'review' | 'mutqin'
  isActive: boolean
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export interface SyncOutbox {
  id?: number
  tableName: string
  operation: 'insert' | 'update'
  payload: Record<string, unknown>
  createdAt: string
  attempts: number
}

// ─── XP Constants ────────────────────────────────────────────────────────────

export const XP_TABLE = {
  baca_correct: 5,
  tulis_correct: 15,
  kata_correct: 10,
  terjemah_correct: 8,
  streak_bonus: 20,      // per day streak milestone (every 7 days)
  mutqin_unlock: 50,
  surah_complete: 100,
} as const

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600,
  6000, 7700, 9700, 12000, 14700, 17800, 21400, 25500, 30200, 35500,
] // index = level
