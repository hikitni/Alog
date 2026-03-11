'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: '全部', href: '/' },
  { label: '日报', href: '/daily' },
  { label: '博客', href: '/blog' },
  { label: '标签', href: '/tags' },
  { label: '作者', href: '/authors' },
  { label: '更新日志', href: '/changelog' },
  { label: '接入', href: '/setup' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2d40] backdrop-blur-md"
      style={{ background: 'rgba(10, 14, 26, 0.85)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="https://github.com/2634213728/Alog" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 group">
          <span className="font-mono font-semibold text-lg tracking-widest text-glow-cyan"
            style={{ color: '#00d4ff' }}>
            ALOG
          </span>
          <span className="text-xs text-slate-500 font-mono tracking-wider hidden sm:block">
            AI WORK LOG
          </span>
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 font-mono
                  ${isActive
                    ? 'text-[#00d4ff] bg-[#00d4ff12] border border-[#00d4ff30]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#ffffff08]'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
