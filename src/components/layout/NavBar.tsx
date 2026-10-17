'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Target, User } from 'lucide-react'

const LINKS = [
  { href: '/dashboard',         icon: Home,     label: 'Beranda' },
  { href: '/latihan',           icon: BookOpen, label: 'Latihan'  },
  { href: '/target',            icon: Target,   label: 'Target'   },
  { href: '/profil',            icon: User,     label: 'Profil'   },
]

export default function NavBar() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50">
      {/* blur backdrop */}
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-xl border-t border-white/[0.06]" />
      <div className="relative flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {LINKS.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                active
                  ? 'text-gold-400'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
