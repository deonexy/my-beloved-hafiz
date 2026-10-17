import Link from 'next/link'
import { BookOpen, PenLine, Eye, Languages } from 'lucide-react'

const MODES = [
  {
    href:    '/latihan?mode=baca',
    icon:    BookOpen,
    label:   'Baca',
    desc:    'Baca dengan hitungan ulang',
    color:   'from-navy-700 to-navy-600',
    accent:  'text-gold-400',
  },
  {
    href:    '/latihan?mode=tulis',
    icon:    PenLine,
    label:   'Tulis',
    desc:    'Tulis dari ingatan',
    color:   'from-navy-700 to-navy-600',
    accent:  'text-jade-400',
  },
  {
    href:    '/latihan?mode=kata',
    icon:    Eye,
    label:   'Kata',
    desc:    'Tebak makna kata',
    color:   'from-navy-700 to-navy-600',
    accent:  'text-blue-400',
  },
  {
    href:    '/latihan?mode=terjemah',
    icon:    Languages,
    label:   'Terjemah',
    desc:    'Cek terjemahan ayat',
    color:   'from-navy-700 to-navy-600',
    accent:  'text-purple-400',
  },
]

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-white/60 text-xs uppercase tracking-wider mb-3 px-1">
        Mode Latihan
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(({ href, icon: Icon, label, desc, accent }) => (
          <Link
            key={href}
            href={href}
            className="card px-4 py-4 hover:border-white/10 active:scale-[0.97] transition-all duration-150"
          >
            <Icon size={20} className={`${accent} mb-3`} strokeWidth={1.5} />
            <div className="text-white font-medium text-sm mb-0.5">{label}</div>
            <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
