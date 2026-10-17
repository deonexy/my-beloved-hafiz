'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PracticeSession from '@/components/hafalan/PracticeSession'
import type { PracticeMode } from '@/types'

function LatihanContent() {
  const params = useSearchParams()
  const mode = (params.get('mode') ?? 'baca') as PracticeMode
  const surah = parseInt(params.get('surah') ?? '1')
  const ayatStart = parseInt(params.get('start') ?? '1')
  const ayatEnd = parseInt(params.get('end') ?? '7')

  return (
    <PracticeSession
      mode={mode}
      surahNumber={surah}
      ayatStart={ayatStart}
      ayatEnd={ayatEnd}
    />
  )
}

export default function LatihanPage() {
  return (
    <Suspense>
      <LatihanContent />
    </Suspense>
  )
}
