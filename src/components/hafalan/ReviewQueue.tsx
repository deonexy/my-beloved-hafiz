import Link from 'next/link'
import type { AyatProgress } from '@/types'

interface ReviewQueueProps {
  reviews: AyatProgress[]
}

export default function ReviewQueue({ reviews }: ReviewQueueProps) {
  return (
    <div className="card px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-medium text-sm">Perlu Muraja&apos;ah</h2>
        <span className="badge-chip">{reviews.length} ayat</span>
      </div>

      <div className="space-y-2 mb-4">
        {reviews.slice(0, 5).map((r) => (
          <div key={`${r.surahNumber}:${r.ayatNumber}`}
            className="flex items-center justify-between py-1.5">
            <span className="text-white/70 text-sm">
              {r.surahNumber}:{r.ayatNumber}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              r.status === 'mutqin'
                ? 'bg-jade-600/30 text-jade-400'
                : 'bg-gold-600/20 text-gold-400'
            }`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>

      <Link
        href={`/latihan?mode=terjemah&review=1`}
        className="btn-gold w-full text-center block"
      >
        Mulai Muraja&apos;ah
      </Link>
    </div>
  )
}
