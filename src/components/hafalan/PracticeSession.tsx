'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { fetchSurahVerses } from '@/lib/quran-data'
import { getDB, getAyatProgress, queueSync } from '@/lib/db'
import { calcNextReview, type ReviewResult } from '@/lib/spaced-repetition'
import { xpForAction, streakMultiplier } from '@/lib/gamification'
import type { PracticeMode } from '@/types'
import { X, ChevronRight, RotateCcw } from 'lucide-react'

interface Props {
  mode: PracticeMode
  surahNumber: number
  ayatStart: number
  ayatEnd: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Verse = any

export default function PracticeSession({ mode, surahNumber, ayatStart, ayatEnd }: Props) {
  const router = useRouter()
  const [verses, setVerses] = useState<Verse[]>([])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [sessionStart] = useState(Date.now())

  useEffect(() => {
    fetchSurahVerses(surahNumber).then((vs) => {
      const subset = vs.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any) => v.verse_number >= ayatStart && v.verse_number <= ayatEnd,
      )
      setVerses(subset)
      setLoading(false)
    })
  }, [surahNumber, ayatStart, ayatEnd])

  const current = verses[idx]

  const handleResult = useCallback(async (result: ReviewResult) => {
    if (!current) return

    const db = getDB()
    const existing = await getAyatProgress(surahNumber, current.verse_number)
    const isCorrect = result !== 'fail'
    const actionKey = `${mode}_correct` as keyof Parameters<typeof xpForAction>[0]
    const stats = await db.userStats.toCollection().first()
    const multi = stats ? streakMultiplier(stats.streakDays) : 1
    const xp = isCorrect ? xpForAction(actionKey as 'baca_correct', multi) : 0

    const { nextReviewAt, newStreak } = calcNextReview({
      correctStreak: existing?.correctStreak ?? 0,
      reviewCount: existing?.reviewCount ?? 0,
      result,
    })

    const newStatus =
      newStreak >= 5 ? 'mutqin' :
      newStreak >= 2 ? 'hafal' :
      'belajar'

    const updated = {
      surahNumber,
      ayatNumber: current.verse_number,
      status: newStatus,
      reviewCount: (existing?.reviewCount ?? 0) + 1,
      correctStreak: newStreak,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt,
      xpEarned: (existing?.xpEarned ?? 0) + xp,
      syncedAt: null,
      updatedAt: new Date().toISOString(),
    }

    if (existing?.id) {
      await db.ayatProgress.update(existing.id, updated)
    } else {
      await db.ayatProgress.add(updated)
    }

    if (xp > 0) {
      await db.userStats.toCollection().modify((s) => {
        s.totalXp += xp
        s.totalAyatHafal = Math.max(s.totalAyatHafal, s.totalAyatHafal + (existing ? 0 : 1))
        if (newStatus === 'mutqin' && existing?.status !== 'mutqin') s.totalAyatMutqin++
        s.updatedAt = new Date().toISOString()
      })
    }

    await queueSync('ayat_progress', existing ? 'update' : 'insert', updated)

    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
    setRevealed(false)

    if (xp > 0) toast.success(`+${xp} XP`, { duration: 1200 })

    if (idx + 1 >= verses.length) {
      // session complete
      const duration = Math.round((Date.now() - sessionStart) / 1000)
      await db.practiceSessions.add({
        mode,
        surahNumber,
        ayatStart,
        ayatEnd,
        score: Math.round(((score.correct + (isCorrect ? 1 : 0)) / (score.total + 1)) * 100),
        durationSeconds: duration,
        xpEarned: 0, // tracked per ayat
        completedAt: new Date().toISOString(),
        synced: false,
      })
      router.push('/dashboard?complete=1')
    } else {
      setIdx((i) => i + 1)
    }
  }, [current, idx, mode, router, score, sessionStart, surahNumber, ayatStart, ayatEnd, verses.length])

  if (loading) return <SessionSkeleton />
  if (!current) return null

  const translation = current.translations?.[0]?.text ?? '—'
  const arabic = current.text_uthmani ?? ''
  const progress = (idx + 1) / verses.length

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <div className="text-white/40 text-xs mb-1">
            Surah {surahNumber} · Mode {mode}
          </div>
          <div className="progress-bar h-1.5">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <span className="text-white/50 text-sm">{idx + 1}/{verses.length}</span>
      </div>

      {/* Ayat card */}
      <div className="card-gold flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-[300px]">
        {/* Arabic */}
        <p className="arabic-lg text-white text-center leading-loose mb-6">
          {arabic}
        </p>
        <p className="text-white/40 text-xs mb-6">
          {surahNumber}:{current.verse_number}
        </p>

        {/* Translation — hidden until revealed */}
        {mode !== 'baca' && (
          <div className={`w-full transition-all duration-300 ${revealed ? 'opacity-100' : 'opacity-0 select-none blur-sm'}`}>
            <div className="bg-navy-700/60 rounded-xl px-5 py-4">
              <p className="text-white/80 text-sm leading-relaxed text-center">
                {translation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="py-6 space-y-3">
        {mode === 'baca' ? (
          /* Reading mode: just mark correct/incorrect */
          <div className="grid grid-cols-3 gap-2">
            <ResultButton label="Lupa" emoji="😟" result="fail" onClick={handleResult} color="border-rose-hafiz/30 text-rose-hafiz" />
            <ResultButton label="Susah" emoji="😅" result="hard" onClick={handleResult} color="border-amber-400/30 text-amber-400" />
            <ResultButton label="Lancar" emoji="✅" result="easy" onClick={handleResult} color="border-jade-400/30 text-jade-400" />
          </div>
        ) : revealed ? (
          <div className="grid grid-cols-3 gap-2">
            <ResultButton label="Lupa" emoji="😟" result="fail" onClick={handleResult} color="border-rose-hafiz/30 text-rose-hafiz" />
            <ResultButton label="Hampir" emoji="🤔" result="ok" onClick={handleResult} color="border-amber-400/30 text-amber-400" />
            <ResultButton label="Hafal" emoji="✅" result="easy" onClick={handleResult} color="border-jade-400/30 text-jade-400" />
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="btn-gold w-full flex items-center justify-center gap-2"
          >
            Lihat Jawaban <ChevronRight size={16} />
          </button>
        )}

        {mode === 'tulis' && !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="btn-ghost w-full flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Tampilkan
          </button>
        )}
      </div>
    </div>
  )
}

function ResultButton({
  label, emoji, result, onClick, color,
}: {
  label: string; emoji: string; result: ReviewResult
  onClick: (r: ReviewResult) => void; color: string
}) {
  return (
    <button
      onClick={() => onClick(result)}
      className={`card flex flex-col items-center gap-1 py-3 border ${color}
                  hover:bg-white/[0.04] active:scale-[0.96] transition-all duration-100`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function SessionSkeleton() {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 pt-4 space-y-4">
      <div className="skeleton h-8 rounded-xl" />
      <div className="skeleton flex-1 rounded-2xl" style={{ minHeight: 300 }} />
      <div className="skeleton h-14 rounded-xl" />
    </div>
  )
}
