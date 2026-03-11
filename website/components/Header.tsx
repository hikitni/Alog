'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

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
  const router   = useRouter()
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchValue('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submitSearch = () => {
    const q = searchValue.trim()
    if (!q) { setSearchOpen(false); return }
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchValue('')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2d40] backdrop-blur-md"
      style={{ background: 'rgba(10, 14, 26, 0.85)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <a href="https://github.com/2634213728/Alog" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 group shrink-0">
          <span className="font-mono font-semibold text-lg tracking-widest text-glow-cyan"
            style={{ color: '#00d4ff' }}>
            ALOG
          </span>
          <span className="text-xs text-slate-500 font-mono tracking-wider hidden sm:block">
            AI WORK LOG
          </span>
        </a>

        {/* Search bar (expanded) */}
        {searchOpen && (
          <div className="flex-1 flex items-center gap-2 max-w-sm">
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="搜索日志标题、内容、标签…"
              className="w-full bg-[#080b14] border border-[#00d4ff40] rounded-md px-3 py-1.5 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00d4ff30] transition-colors"
            />
            <button
              onClick={submitSearch}
              className="px-3 py-1.5 rounded-md text-xs font-mono border border-[#00d4ff30] text-[#00d4ff] bg-[#00d4ff08] hover:bg-[#00d4ff15] shrink-0 transition-all"
            >
              搜索
            </button>
          </div>
        )}

        {/* Nav */}
        {!searchOpen && (
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 font-mono whitespace-nowrap
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
        )}

        {/* Search icon toggle */}
        <button
          onClick={() => { setSearchOpen((o) => !o); setSearchValue('') }}
          className={`shrink-0 p-1.5 rounded-md transition-all duration-200 ${
            searchOpen
              ? 'text-[#00d4ff] bg-[#00d4ff15] border border-[#00d4ff30]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#ffffff08]'
          }`}
          title={searchOpen ? '关闭搜索' : '搜索日志'}
        >
          {searchOpen
            ? <span className="text-sm font-mono">✕</span>
            : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
          }
        </button>
      </div>
    </header>
  )
}

