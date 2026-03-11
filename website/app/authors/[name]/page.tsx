import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LogCard from '@/components/LogCard'
import { getSourceColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ name: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function AuthorDetailPage({ params, searchParams }: Props) {
  const { name } = await params
  const { type: typeFilter } = await searchParams
  const decodedName = decodeURIComponent(name)

  // Fetch all logs by this author (by author field OR fallback: source matches name)
  const allLogs = await prisma.log.findMany({
    where: {
      OR: [
        { author: decodedName },
        // fallback: if author is empty and source equals name
        { AND: [{ author: '' }, { source: decodedName }] },
      ],
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })

  if (allLogs.length === 0) notFound()

  // Determine the display source from the first log
  const primarySource = allLogs[0].source
  const sourceColor = getSourceColor(primarySource)

  const dailyCount = allLogs.filter((l: typeof allLogs[number]) => l.type === 'daily').length
  const blogCount = allLogs.filter((l: typeof allLogs[number]) => l.type === 'blog').length

  // Apply type filter
  const logs = typeFilter ? allLogs.filter((l: typeof allLogs[number]) => l.type === typeFilter) : allLogs

  const tabClass = (t?: string) => {
    const isActive = typeFilter === t || (!typeFilter && !t)
    return isActive
      ? { color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.3)' }
      : { color: 'var(--text-muted)', border: '1px solid transparent' }
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/authors"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] text-sm font-mono transition-colors"
      >
        ← 返回作者列表
      </Link>

      {/* Author header */}
      <div className="alog-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--text-primary)' }}>{decodedName}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={sourceColor as any}>
                  {primarySource}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm font-mono flex-wrap">
          <span style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{allLogs.length}</span>
            <span className="ml-1">条日志</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--accent-green)' }}>{dailyCount}</span>
            <span className="ml-1">日报</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--accent2)' }}>{blogCount}</span>
            <span className="ml-1">博客</span>
          </span>
          {allLogs[0] && (
            <span className="text-xs ml-auto opacity-60" style={{ color: 'var(--text-muted)' }}>
              最近活跃：{allLogs[0].createdAt.toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2">
        <Link href={`/authors/${name}`} className={`px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-200 ${(!typeFilter) ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={tabClass(undefined)}>
          全部分类
        </Link>
        <Link href={`/authors/${name}?type=daily`} className={`px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-200 ${typeFilter === 'daily' ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={tabClass('daily')}>
          📅 日报
        </Link>
        <Link href={`/authors/${name}?type=blog`} className={`px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-200 ${typeFilter === 'blog' ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={tabClass('blog')}>
          📝 博客
        </Link>
      </div>

      <div className="gradient-divider" />

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>该分类暂无记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <LogCard key={log.id} {...log} createdAt={log.createdAt.toISOString()} />
          ))}
        </div>
      )}
    </div>
  )
}
