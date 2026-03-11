import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      logs: {
        include: { log: { include: { tags: { include: { tag: true } } } } },
        orderBy: { log: { createdAt: 'desc' } },
      },
    },
  })

  if (!tag) notFound()

  const logs = tag.logs.map((lt: typeof tag.logs[number]) => lt.log)

  return (
    <div className="space-y-8">
      <div>
        <Link href="/tags" className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs font-mono transition-colors mb-3 inline-block">
          ← 所有标签
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl opacity-60 text-[var(--accent)]">#</span>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold font-mono tracking-wide">{tag.name}</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm mt-1 ml-7">
          共 <span className="text-[var(--accent)] font-mono">{logs.length}</span> 条记录
        </p>
      </div>

      <div className="gradient-divider" />

      <div className="space-y-4">
        {logs.map((log) => (
          <LogCard key={log.id} {...log} createdAt={log.createdAt.toISOString()} />
        ))}
      </div>
    </div>
  )
}
