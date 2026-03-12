'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { Search, X, CornerDownLeft } from 'lucide-react'

export default function Header() {
  const router   = useRouter()
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchValue('') }
      // Ctrl+K / Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
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

  const closeSearch = () => { setSearchOpen(false); setSearchValue('') }

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
        <div className="header-scan-line" />
        <div className="px-5 h-14 flex items-center justify-between gap-3">
          {/* Hamburger — mobile only, toggles sidebar drawer */}
          <button
            className="sidebar-toggle-btn"
            aria-label="展开侧边栏"
            onClick={() => document.dispatchEvent(new Event('toggleSidebar'))}
          >
            <span /><span /><span />
          </button>

          {/* Logo */}
          <a href="https://github.com/2634213728/Alog" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 shrink-0 transition-all duration-200 hover:scale-[1.02]">
            <div className="logo-icon-block">🤖</div>
            <span className="font-mono font-bold text-lg tracking-widest logo-shimmer">ALOG</span>
            <span className="text-xs font-mono tracking-wider hidden md:block" style={{ color: 'var(--text-muted)' }}>
              AI WORK LOG
            </span>
          </a>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Search trigger — glowing cyber button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="search-trigger-btn"
              title="搜索 (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="search-trigger-label">搜索</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Cyber Search Overlay ── */}
      {searchOpen && (
        <div className="cyber-search-overlay" onClick={closeSearch}>
          <div className="cyber-search-panel" onClick={(e) => e.stopPropagation()}>
            {/* top glow bar */}
            <div className="cyber-search-glow-bar" />
            {/* title row */}
            <div className="cyber-search-header">
              <span className="cyber-search-icon"><Search className="w-5 h-5" /></span>
              <span className="cyber-search-title">// SEARCH LOGS</span>
              <button className="cyber-search-close" onClick={closeSearch}><X className="w-4 h-4" /></button>
            </div>
            {/* input */}
            <div className="cyber-search-input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                placeholder="输入关键词搜索日志、标签、作者…"
                className="cyber-search-input"
              />
              <button
                onClick={submitSearch}
                className="cyber-search-submit"
                disabled={!searchValue.trim()}
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
            {/* hints */}
            <div className="cyber-search-hints">
              <span><kbd>Enter</kbd> 搜索</span>
              <span><kbd>Esc</kbd> 关闭</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

