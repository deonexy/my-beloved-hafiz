'use client'

import { useEffect, useRef } from 'react'

interface XPBarProps {
  progress: number   // 0 to 1
  from?: number      // previous progress (for animation start)
}

export default function XPBar({ progress, from = 0 }: XPBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fillRef.current) return
    const el = fillRef.current
    el.style.setProperty('--xp-from', `${from * 100}%`)
    el.style.setProperty('--xp-to', `${progress * 100}%`)
    // trigger reflow then animate
    el.classList.remove('animate-xp-fill')
    void el.offsetWidth
    el.classList.add('animate-xp-fill')
  }, [progress, from])

  return (
    <div className="progress-bar">
      <div
        ref={fillRef}
        className="progress-fill"
        style={{ width: `${progress * 100}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
