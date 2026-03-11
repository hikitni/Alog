import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getSourceColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
  const logs = await prisma.log.findMany({
    select: { author: true, source: true, type: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Aggregate by author
  const authorMap = new Map<string, {
    name: string
    source: string
    logCount: number
    dailyCount: number
    blogCount: number
    lastActive: Date
  }>()

  for (const log of logs) {
    const name = log.author || log.source
    if (!authorMap.has(name)) {
      authorMap.set(name, {
        name,
        source: log.source,
        logCount: 0,
        dailyCount: 0,
        blogCount: 0,
        lastActive: log.createdAt,
      })
    }
    const entry = authorMap.get(name)!
    entry.logCount++
    if (log.type === 'daily') entry.dailyCount++
    else if (log.type === 'blog') entry.blogCount++
    if (log.createdAt > entry.lastActive) entry.lastActive = log.createdAt
  }

  const authors = Array.from(authorMap.values()).sort((a, b) => b.logCount - a.logCount)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--accent)' }}>作者</h1>
        </div>
        <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>
          共 <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{authors.length}</span> 位作者 ·{' '}
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{logs.length}</span> 条日志
        </p>
      </div>

      <div className="gradient-divider" />

      {authors.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 opacity-30">👤</div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>暂无作者数据</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>推送日志时在 API Key 中设置作者名即可</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {authors.map((author) => {
            const sourceColor = getSourceColor(author.source)
            return (
              <Link
                key={author.name}
                href={`/authors/${encodeURIComponent(author.name)}`}
                className="alog-card p-5 group block transition-all duration-200 border-[var(--border)] hover:border-[var(--border-hover)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="font-semibold transition-colors font-mono text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                      {author.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={sourceColor as any}>
                    {author.source}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent)' }}>{author.logCount} 条</span>
                  <span style={{ color: 'var(--accent-green)' }}>{author.dailyCount} 日报</span>
                  <span style={{ color: 'var(--accent2)' }}>{author.blogCount} 博客</span>
                </div>

                <p className="text-xs font-mono mt-2 opacity-60" style={{ color: 'var(--text-muted)' }}>
                  最近活跃：{author.lastActive.toLocaleDateString('zh-CN')}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
