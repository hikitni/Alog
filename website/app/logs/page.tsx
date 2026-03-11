import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import TagBadge from '@/components/TagBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const [logs, tags] = await Promise.all([
    prisma.log.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.tag.findMany({
      include: { _count: { select: { logs: true } } },
      orderBy: { logs: { _count: 'desc' } },
      take: 20,
    }),
  ])

  const dailyCount = logs.filter((l: typeof logs[number]) => l.type === 'daily').length
  const blogCount  = logs.filter((l: typeof logs[number]) => l.type === 'blog').length

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--text-primary)' }}>
            全部日志
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            共 <span className="font-mono" style={{ color: 'var(--accent)' }}>{logs.length}</span> 条记录 ·{' '}
            <Link href="/daily" className="hover:underline transition-colors" style={{ color: 'var(--accent-green)' }}>
              {dailyCount} 日报
            </Link>{' '}·{' '}
            <Link href="/blog" className="hover:underline transition-colors" style={{ color: 'var(--accent2)' }}>
              {blogCount} 博客
            </Link>
          </p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} slug={tag.slug} count={tag._count.logs} size="md" />
          ))}
        </div>
      )}

      <div className="gradient-divider" />

      {logs.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 opacity-30">◈</div>
          <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>暂无日志</p>
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
