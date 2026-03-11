'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { label: '概览', href: '/' },
  { label: '日志', href: '/logs' },
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
    <header className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: 'rgba(var(--accent-rgb,10,14,26), 0)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <a href="https://github.com/2634213728/Alog" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 group shrink-0">
          <span className="font-mono font-semibold text-lg tracking-widest text-glow-cyan"
            style={{ color: 'var(--accent)' }}>
            ALOG
          </span>
          <span className="text-xs font-mono tracking-wider hidden sm:block" style={{ color: 'var(--text-muted)' }}>
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
              className="alog-input w-full rounded-md px-3 py-1.5 text-sm font-mono"
            />
            <button
              onClick={submitSearch}
              className="px-3 py-1.5 rounded-md text-xs font-mono shrink-0 transition-all"
              style={{ border: '1px solid rgba(var(--accent-rgb),0.3)', color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.08)' }}
            >
              搜索
            </button>
          </div>
        )}

        {/* Nav */}
        {!searchOpen && (
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 font-mono whitespace-nowrap"
                  style={isActive
                    ? { color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.09)', border: '1px solid rgba(var(--accent-rgb),0.22)' }
                    : { color: 'var(--text-muted)' }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.05)' } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = '' } }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search toggle */}
          <button
            onClick={() => { setSearchOpen((o) => !o); setSearchValue('') }}
            className={`p-1.5 rounded-md transition-all duration-200 ${searchOpen ? '' : 'theme-toggle'}`}
            style={searchOpen
              ? { color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.3)' }
              : {}}
            title={searchOpen ? '关闭搜索' : '搜索日志'}
          >
            {searchOpen
              ? <span className="text-sm font-mono leading-none">✕</span>
              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
            }
          </button>
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

