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
        <Link href="/tags" className="text-xs font-mono text-slate-500 hover:text-[#00d4ff] transition-colors mb-3 inline-block">
          ← 所有标签
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[#00d4ff] font-mono text-2xl opacity-60">#</span>
          <h1 className="text-2xl font-bold font-mono text-[#e2e8f0]">{tag.name}</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1 ml-7">
          共 <span className="text-[#00d4ff] font-mono">{logs.length}</span> 条记录
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
