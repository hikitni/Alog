import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import TagBadge from '@/components/TagBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
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
  const blogCount = logs.filter((l: typeof logs[number]) => l.type === 'blog').length

  return (
    <div className="space-y-8">
      {/* Hero stats */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-mono tracking-wide">
            工作日志
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            共 <span className="text-[#00d4ff] font-mono">{logs.length}</span> 条记录 ·{' '}
            <Link href="/daily" className="hover:text-[#10b981] transition-colors">
              {dailyCount} 日报
            </Link>{' '}
            ·{' '}
            <Link href="/blog" className="hover:text-purple-400 transition-colors">
              {blogCount} 博客
            </Link>
          </p>
        </div>
      </div>

      {/* Tag cloud */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              slug={tag.slug}
              count={tag._count.logs}
              size="md"
            />
          ))}
        </div>
      )}

      <div className="gradient-divider" />

      {/* Log list */}
      {logs.length === 0 ? (
        <EmptyState />
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

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-4xl mb-4 opacity-30">◈</div>
      <p className="text-slate-500 font-mono text-sm">暂无日志</p>
      <p className="text-slate-600 text-xs mt-2">
        配置 Shell 函数后，使用 AI 工具说「生成alog日报」即可推送
      </p>
    </div>
  )
}

