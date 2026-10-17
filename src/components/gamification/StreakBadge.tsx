interface StreakBadgeProps {
  streak: number
  multiplier: number
}

export default function StreakBadge({ streak, multiplier }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2 bg-navy-700/60 border border-white/[0.06] rounded-xl px-3 py-2">
      <span className="animate-flame text-xl">🔥</span>
      <div className="text-right">
        <div className="text-white text-sm font-semibold leading-none">{streak}</div>
        <div className="text-white/40 text-[10px] leading-none mt-0.5">
          {multiplier > 1 ? `×${multiplier} XP` : 'hari'}
        </div>
      </div>
    </div>
  )
}
