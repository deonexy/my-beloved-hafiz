/**
 * Spaced repetition — SM-2 inspired algorithm adapted for Quran hafalan.
 * Returns the ISO timestamp for next review.
 */

import { addDays, addHours, formatISO } from 'date-fns'

export type ReviewResult = 'fail' | 'hard' | 'ok' | 'easy'

interface SRInput {
  correctStreak: number
  reviewCount: number
  result: ReviewResult
}

interface SROutput {
  nextReviewAt: string
  newStreak: number
}

const INTERVALS: Record<ReviewResult, (streak: number) => number> = {
  fail:  () => 0,           // review again in ~4 hours
  hard:  () => 1,           // next day
  ok:    (s) => s <= 1 ? 3 : s <= 3 ? 7 : 14,
  easy:  (s) => s <= 1 ? 7 : s <= 3 ? 21 : 42,
}

export function calcNextReview({ correctStreak, reviewCount, result }: SRInput): SROutput {
  const now = new Date()

  if (result === 'fail') {
    return {
      nextReviewAt: formatISO(addHours(now, 4)),
      newStreak: 0,
    }
  }

  const days = INTERVALS[result](correctStreak)
  const newStreak = result === 'fail' ? 0 : correctStreak + 1

  return {
    nextReviewAt: formatISO(addDays(now, days)),
    newStreak,
  }
}

/**
 * Calculate daily target ayat to achieve full 30-juz in targetYears.
 * Accounts for 70% new memorization + 30% review time split.
 */
export function calcDailyTarget(
  targetYears: number,
  alreadyHafal: number = 0,
): { dailyNew: number; dailyReview: number } {
  const totalAyat = 6236
  const remaining = totalAyat - alreadyHafal
  const daysTotal = targetYears * 365
  // 5 day/week memorization pace (rest days & Juma review)
  const activeDays = Math.floor(daysTotal * (5 / 7))
  const dailyNew = Math.ceil(remaining / activeDays)
  // Review: each ayat needs ~1 review/week once hafal
  const dailyReview = Math.ceil((alreadyHafal / 7) + dailyNew * 0.3)
  return { dailyNew, dailyReview }
}
