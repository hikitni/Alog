import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'

function fmtMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1)
}

function memBar(used: number, total: number) {
  const pct = Math.min(Math.round((used / total) * 100), 100)
  const filled = Math.round(pct / 10)
  return { pct, bar: '█'.repeat(filled) + '░'.repeat(10 - filled) }
}

// Cache DB queries for 30 seconds to avoid hitting SQLite on every request
const getSidebarData = unstable_cache(
  async () => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const [totalLogs, dailyCount, blogCount, todayCount, topTags] = await Promise.all([
      prisma.log.count(),
      prisma.log.count({ where: { type: 'daily' } }),
      prisma.log.count({ where: { type: 'blog' } }),
      prisma.log.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.tag.findMany({
        include: { _count: { select: { logs: true } } },
        orderBy: { logs: { _count: 'desc' } },
        take: 10,
      }),
    ])
    return { totalLogs, dailyCount, blogCount, todayCount, topTags }
  },
  ['sidebar-data'],
  { revalidate: 30 }
)

export default async function Sidebar() {
  const mem = process.memoryUsage()
  const heapUsed  = Number(fmtMB(mem.heapUsed))
  const heapTotal = Number(fmtMB(mem.heapTotal))
  const rss       = Number(fmtMB(mem.rss))
  const external  = Number(fmtMB(mem.external))
  const { pct: heapPct } = memBar(mem.heapUsed, mem.heapTotal)
  const heapColor = heapPct >= 80 ? '#f87171' : heapPct >= 60 ? '#fb923c' : 'var(--accent-green)'

  const { totalLogs, dailyCount, blogCount, todayCount, topTags } = await getSidebarData()

  const categories = [
    { label: '全部日志', href: '/logs',  icon: '◈', count: totalLogs },
    { label: '工作日报', href: '/daily', icon: '📅', count: dailyCount },
    { label: '技术博客', href: '/blog',  icon: '📝', count: blogCount },
  ]

  return (
    <>

      {/* ── System Status ── */}
      <div className="sb-status-panel">
        <div className="sb-title">// System Status</div>

        {/* Online + today */}
        <div className="sb-status-row">
          <span className="status-dot" />
          <span className="sb-online-text">ONLINE</span>
          <span className="sb-status-sep" />
          <span className="sb-today-label">今日推送</span>
          <span className="sb-today-val">{todayCount}</span>
        </div>

        {/* Heap */}
        <div className="sb-metric-row">
          <span className="sb-metric-key">HEAP</span>
          <div className="sb-metric-right">
            <span className="sb-metric-num" style={{ color: heapColor }}>{heapUsed}</span>
            <span className="sb-metric-unit">/ {heapTotal} MB</span>
            <span className="sb-metric-pct" style={{ color: heapColor }}>{heapPct}%</span>
          </div>
        </div>
        <div className="sb-bar-track">
          <div className="sb-bar-fill" style={{ width: `${heapPct}%`, background: heapColor }} />
        </div>

        {/* RSS + External */}
        <div className="sb-metric-row" style={{ marginTop: 8 }}>
          <span className="sb-metric-key">RSS</span>
          <div className="sb-metric-right">
            <span className="sb-metric-num">{rss}</span>
            <span className="sb-metric-unit">MB</span>
          </div>
        </div>
        <div className="sb-metric-row">
          <span className="sb-metric-key">External</span>
          <div className="sb-metric-right">
            <span className="sb-metric-num">{external}</span>
            <span className="sb-metric-unit">MB</span>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div>
        <div className="sb-title">// Categories</div>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.href}>
              <Link href={cat.href} className="sb-cat-item">
                <span className="flex items-center gap-2">
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span className="sb-count">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Hot Tags ── */}
      {topTags.length > 0 && (
        <div>
          <div className="sb-title">// Hot Tags</div>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono transition-all duration-200"
                style={{
                  background: 'rgba(var(--accent2-rgb),0.08)',
                  border: '1px solid rgba(var(--accent2-rgb),0.25)',
                  color: 'var(--accent2)',
                }}
              >
                {tag.name}
                <span className="text-[9px] opacity-50">{tag._count.logs}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Nav ── */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="space-y-1">
          {[
            { href: '/',          label: '概览首页', icon: '◉' },
            { href: '/tags',      label: '所有标签', icon: '🏷️' },
            { href: '/authors',   label: '贡献作者', icon: '👤' },
            { href: '/changelog', label: '更新日志', icon: '⏳' },
            { href: '/setup',     label: '快速接入', icon: '🔌' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="sb-cat-item text-xs">
              <span className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

    </>
  )
}
