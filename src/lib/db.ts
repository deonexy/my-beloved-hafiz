/**
 * Dexie (IndexedDB) — local-first database
 * All writes go here first; sync worker pushes to Supabase when online.
 */

import Dexie, { Table } from 'dexie'
import type {
  AyatProgress,
  PracticeSession,
  UserStats,
  HafalanTarget,
  SyncOutbox,
} from '@/types'

export class HafizDB extends Dexie {
  ayatProgress!: Table<AyatProgress, number>
  practiceSessions!: Table<PracticeSession, number>
  userStats!: Table<UserStats, number>
  hafalanTarget!: Table<HafalanTarget, number>
  syncOutbox!: Table<SyncOutbox, number>

  constructor() {
    super('HafizDB')

    this.version(1).stores({
      ayatProgress:     '++id, [surahNumber+ayatNumber], status, nextReviewAt, syncedAt',
      practiceSessions: '++id, mode, surahNumber, completedAt, synced',
      userStats:        '++id',
      hafalanTarget:    '++id, isActive',
      syncOutbox:       '++id, tableName, createdAt',
    })
  }
}

// Singleton — safe in browser, skip on SSR
let _db: HafizDB | null = null

export function getDB(): HafizDB {
  if (typeof window === 'undefined') {
    throw new Error('getDB() called on server — use only in browser context')
  }
  if (!_db) _db = new HafizDB()
  return _db
}

// ─── Helper: get or create userStats row ────────────────────────────────────

export async function getOrCreateStats(): Promise<UserStats> {
  const db = getDB()
  const existing = await db.userStats.toCollection().first()
  if (existing) return existing

  const initial: UserStats = {
    totalXp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    totalAyatHafal: 0,
    totalAyatMutqin: 0,
    totalSurahComplete: 0,
    longestStreak: 0,
    updatedAt: new Date().toISOString(),
  }
  const id = await db.userStats.add(initial)
  return { ...initial, id }
}

// ─── Helper: ayat progress ───────────────────────────────────────────────────

export async function getAyatProgress(
  surahNumber: number,
  ayatNumber: number,
): Promise<AyatProgress | undefined> {
  const db = getDB()
  return db.ayatProgress
    .where('[surahNumber+ayatNumber]')
    .equals([surahNumber, ayatNumber])
    .first()
}

// ─── Helper: ayat due for review (spaced repetition) ────────────────────────

export async function getAyatDueForReview(limit = 20): Promise<AyatProgress[]> {
  const db = getDB()
  const now = new Date().toISOString()
  return db.ayatProgress
    .where('nextReviewAt')
    .belowOrEqual(now)
    .filter((a) => a.status === 'hafal' || a.status === 'mutqin')
    .limit(limit)
    .toArray()
}

// ─── Helper: queue sync ──────────────────────────────────────────────────────

export async function queueSync(
  tableName: string,
  operation: 'insert' | 'update',
  payload: Record<string, unknown>,
): Promise<void> {
  const db = getDB()
  await db.syncOutbox.add({
    tableName,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  })
}
