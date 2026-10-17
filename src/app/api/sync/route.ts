import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sql from '@/lib/neon'

// POST /api/sync — flush Dexie outbox items to Neon
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const { items } = await req.json() as { items: SyncItem[] }

  const results: { id: string; ok: boolean; error?: string }[] = []

  for (const item of items) {
    try {
      if (item.table === 'ayat_progress') {
        await sql`
          INSERT INTO ayat_progress
            (user_id, surah_number, ayat_number, status, review_count, correct_streak,
             last_reviewed_at, next_review_at, xp_earned, updated_at)
          VALUES
            (${userId}, ${item.data.surahNumber}, ${item.data.ayatNumber},
             ${item.data.status}, ${item.data.reviewCount}, ${item.data.correctStreak},
             ${item.data.lastReviewedAt ?? null}, ${item.data.nextReviewAt ?? null},
             ${item.data.xpEarned ?? 0}, now())
          ON CONFLICT (user_id, surah_number, ayat_number)
          DO UPDATE SET
            status           = EXCLUDED.status,
            review_count     = EXCLUDED.review_count,
            correct_streak   = EXCLUDED.correct_streak,
            last_reviewed_at = EXCLUDED.last_reviewed_at,
            next_review_at   = EXCLUDED.next_review_at,
            xp_earned        = EXCLUDED.xp_earned,
            updated_at       = now()
        `
      } else if (item.table === 'user_stats') {
        await sql`
          INSERT INTO user_stats
            (user_id, total_xp, level, streak_days, last_active_date,
             total_ayat_hafal, total_ayat_mutqin, total_surah_complete, longest_streak)
          VALUES
            (${userId}, ${item.data.totalXp}, ${item.data.level}, ${item.data.streakDays},
             ${item.data.lastActiveDate ?? null}, ${item.data.totalAyatHafal},
             ${item.data.totalAyatMutqin}, ${item.data.totalSurahComplete}, ${item.data.longestStreak})
          ON CONFLICT (user_id)
          DO UPDATE SET
            total_xp             = EXCLUDED.total_xp,
            level                = EXCLUDED.level,
            streak_days          = EXCLUDED.streak_days,
            last_active_date     = EXCLUDED.last_active_date,
            total_ayat_hafal     = EXCLUDED.total_ayat_hafal,
            total_ayat_mutqin    = EXCLUDED.total_ayat_mutqin,
            total_surah_complete = EXCLUDED.total_surah_complete,
            longest_streak       = EXCLUDED.longest_streak,
            updated_at           = now()
        `
      } else if (item.table === 'practice_sessions') {
        await sql`
          INSERT INTO practice_sessions
            (user_id, mode, surah_number, ayat_start, ayat_end, score, duration_seconds, xp_earned, completed_at)
          VALUES
            (${userId}, ${item.data.mode}, ${item.data.surahNumber},
             ${item.data.ayatStart}, ${item.data.ayatEnd}, ${item.data.score},
             ${item.data.durationSeconds}, ${item.data.xpEarned}, ${item.data.completedAt})
        `
      } else if (item.table === 'hafalan_targets') {
        await sql`
          INSERT INTO hafalan_targets
            (user_id, target_years, start_date, target_date, daily_ayat_target, weekly_review_target)
          VALUES
            (${userId}, ${item.data.targetYears}, ${item.data.startDate},
             ${item.data.targetDate}, ${item.data.dailyAyatTarget}, ${item.data.weeklyReviewTarget})
          ON CONFLICT DO NOTHING
        `
      }
      results.push({ id: item.id, ok: true })
    } catch (err) {
      console.error('[sync]', item.table, err)
      results.push({ id: item.id, ok: false, error: String(err) })
    }
  }

  return NextResponse.json({ results })
}

interface SyncItem {
  id: string
  table: string
  data: Record<string, unknown>
}
