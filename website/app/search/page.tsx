'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LogCard from '@/components/LogCard'

interface Tag { id: string; name: string; slug: string }
interface LogItem {
  id: string; type: string; title: string; content: string
  source: string; author: string; createdAt: string
  viewCount: number; tags: { tag: Tag }[]
}
interface SearchResult {
  logs: LogItem[]; total: number; page: number
  pageSize: number; totalPages: number
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const initQ      = searchParams.get('q')      ?? ''
  const initType   = searchParams.get('type')   ?? ''
  const initAuthor = searchParams.get('author') ?? ''
  const initFrom   = searchParams.get('from')   ?? ''
  const initTo     = searchParams.get('to')     ?? ''
  const initPage   = parseInt(searchParams.get('page') ?? '1')

  const [q,      setQ]      = useState(initQ)
  const [type,   setType]   = useState(initType)
  const [author, setAuthor] = useState(initAuthor)
  const [from,   setFrom]   = useState(initFrom)
  const [to,     setTo]     = useState(initTo)
  const [page,   setPage]   = useState(initPage)

  const [result,  setResult]  = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [authors, setAuthors] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(!!(initType || initAuthor || initFrom || initTo))

  const inputRef   = useRef<HTMLInputElement>(null)
  const debounceId = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load author list for filter dropdown
  useEffect(() => {
    fetch('/api/authors').then(r => r.json()).then(d => {
      setAuthors((d.authors ?? []).map((a: { name: string }) => a.name))
    }).catch(() => {})
  }, [])

  const buildParams = useCallback((overrides?: Record<string, string | number>) => {
    const p: Record<string, string> = {}
    const vals = { q, type, author, from, to, page, ...overrides }
    if (vals.q)      p.q      = String(vals.q)
    if (vals.type)   p.type   = String(vals.type)
    if (vals.author) p.author = String(vals.author)
    if (vals.from)   p.from   = String(vals.from)
    if (vals.to)     p.to     = String(vals.to)
    if (Number(vals.page) > 1) p.page = String(vals.page)
    return new URLSearchParams(p)
  }, [q, type, author, from, to, page])

  const doSearch = useCallback(async (overrides?: Record<string, string | number>) => {
    setLoading(true)
    const params = buildParams(overrides)
    params.set('pageSize', '20')
    // Sync URL (no navigation)
    const url = `/search?${params}`
    window.history.replaceState(null, '', url)
    try {
      const res  = await fetch(`/api/logs?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  // Initial search on mount
  useEffect(() => {
    doSearch({ page: 1 })
    inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce q changes (300ms)
  useEffect(() => {
    clearTimeout(debounceId.current)
    debounceId.current = setTimeout(() => {
      setPage(1)
      doSearch({ page: 1, q })
    }, 300)
    return () => clearTimeout(debounceId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  // Immediate search on filter changes
  const applyFilter = (key: string, value: string) => {
    setPage(1)
    if (key === 'type')   setType(value)
    if (key === 'author') setAuthor(value)
    if (key === 'from')   setFrom(value)
    if (key === 'to')     setTo(value)
    doSearch({ [key]: value, page: 1 })
  }

  const gotoPage = (p: number) => {
    setPage(p)
    doSearch({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearAll = () => {
    setQ(''); setType(''); setAuthor(''); setFrom(''); setTo(''); setPage(1)
    doSearch({ q: '', type: '', author: '', from: '', to: '', page: 1 })
    inputRef.current?.focus()
  }

  const hasFilters = !!(type || author || from || to)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--text-primary)' }}>检索</h1>
        </div>
        <p className="text-sm mt-1 ml-10 font-mono" style={{ color: 'var(--text-muted)' }}>
          全文检索 · 支持标题、正文、标签
        </p>
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && router.push('/')}
            placeholder="搜索日志标题、正文、标签…"
            className="w-full bg-[#080b14] border border-[#1e2d40] focus:border-[#00d4ff40] rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
          />
          {q && (
            <button onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`px-3 py-2 rounded-lg border text-sm font-mono transition-all shrink-0 ${
            hasFilters || showFilters
              ? 'border-[#00d4ff40] text-[#00d4ff] bg-[#00d4ff10]'
              : 'border-[#1e2d40] text-slate-400 hover:border-[#00d4ff30] hover:text-slate-200'
          }`}
        >
          过滤{hasFilters ? ` (${[type, author, from, to].filter(Boolean).length})` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="alog-card p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">类型</label>
              <select
                value={type}
                onChange={(e) => applyFilter('type', e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-2 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] transition-colors"
              >
                <option value="">全部</option>
                <option value="daily">日报</option>
                <option value="blog">博客</option>
              </select>
            </div>
            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">作者</label>
              <select
                value={author}
                onChange={(e) => applyFilter('author', e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-2 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] transition-colors"
              >
                <option value="">全部</option>
                {authors.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {/* From */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">开始日期</label>
              <input
                type="date"
                value={from}
                onChange={(e) => applyFilter('from', e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-2 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] transition-colors"
              />
            </div>
            {/* To */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">结束日期</label>
              <input
                type="date"
                value={to}
                onChange={(e) => applyFilter('to', e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-2 py-1.5 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] transition-colors"
              />
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearAll}
              className="text-xs font-mono text-slate-500 hover:text-red-400 transition-colors">
              ✕ 清除所有过滤条件
            </button>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
        {loading ? (
          <span className="animate-pulse">检索中…</span>
        ) : result ? (
          <span>
            共 <span className="text-[#00d4ff] font-medium">{result.total}</span> 条结果
            {q && <span>，关键字 &ldquo;<span className="text-slate-300">{q}</span>&rdquo;</span>}
          </span>
        ) : null}
        {result && result.totalPages > 1 && (
          <span>第 {result.page} / {result.totalPages} 页</span>
        )}
      </div>

      <div className="gradient-divider" />

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="alog-card p-5 animate-pulse">
              <div className="h-4 bg-[#1e2d40] rounded w-1/4 mb-3" />
              <div className="h-5 bg-[#1e2d40] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#1e2d40] rounded w-full mb-1" />
              <div className="h-3 bg-[#1e2d40] rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && result && result.logs.length === 0 && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 opacity-30">◈</div>
          <p className="text-slate-500 font-mono text-sm">
            {q || hasFilters ? `未找到匹配的日志，试试其他关键字或调整过滤条件` : '暂无日志'}
          </p>
        </div>
      )}

      {!loading && result && result.logs.length > 0 && (
        <div className="space-y-4">
          {result.logs.map((log) => (
            <LogCard key={log.id} {...log} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => gotoPage(result.page - 1)}
            disabled={result.page <= 1}
            className="px-3 py-1.5 rounded-md text-sm font-mono border border-[#1e2d40] text-slate-400 hover:border-[#00d4ff30] hover:text-[#00d4ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← 上一页
          </button>
          {Array.from({ length: result.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === result.totalPages || Math.abs(p - result.page) <= 2)
            .reduce<(number | '…')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '…'
                ? <span key={`e${i}`} className="px-2 text-slate-600 font-mono text-sm">…</span>
                : <button
                    key={p}
                    onClick={() => gotoPage(p as number)}
                    className={`px-3 py-1.5 rounded-md text-sm font-mono border transition-all ${
                      p === result.page
                        ? 'border-[#00d4ff40] text-[#00d4ff] bg-[#00d4ff10]'
                        : 'border-[#1e2d40] text-slate-400 hover:border-[#00d4ff30] hover:text-[#00d4ff]'
                    }`}
                  >{p}</button>
            )
          }
          <button
            onClick={() => gotoPage(result.page + 1)}
            disabled={result.page >= result.totalPages}
            className="px-3 py-1.5 rounded-md text-sm font-mono border border-[#1e2d40] text-slate-400 hover:border-[#00d4ff30] hover:text-[#00d4ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-mono tracking-wide">检索</h1>
        </div>
        <div className="alog-card p-5 animate-pulse h-12" />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  )
}
