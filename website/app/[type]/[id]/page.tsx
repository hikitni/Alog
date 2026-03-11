import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TagBadge from '@/components/TagBadge'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ViewCounter from '@/components/ViewCounter'
import LogActions from '@/components/LogActions'
import { formatDateTime, getSourceColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ type: string; id: string }>
}

const TYPE_CONFIG = {
  daily: { label: '日报', icon: '📅', accent: '#10b981' },
  blog:  { label: '博客', icon: '📝', accent: '#a78bfa' },
}

export default async function LogDetailPage({ params }: Props) {
  const { type, id } = await params

  if (!['daily', 'blog'].includes(type)) notFound()

  const log = await prisma.log.findFirst({
    where: { id, type },
    include: { tags: { include: { tag: true } } },
  })

  if (!log) notFound()

  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
  const sourceColor = getSourceColor(log.source)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href={`/${type}`}
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] text-sm font-mono transition-colors"
      >
        ← 返回{config.label}列表
      </Link>

      {/* Header */}
      <div className="space-y-4">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">{config.icon}</span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-full border"
            style={{ color: config.accent, borderColor: `${config.accent}40`, background: `${config.accent}10` }}
          >
            {config.label}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={sourceColor as any}>
            {log.source}
          </span>
          {log.author && (
            <Link
              href={`/authors/${encodeURIComponent(log.author)}`}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs font-mono transition-colors"
            >
              {log.author}
            </Link>
          )}
          <time className="text-xs font-mono ml-auto" style={{ color: 'var(--text-muted)' }}>
            {formatDateTime(log.createdAt)}
          </time>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {log.title}
        </h1>

        {/* Tags */}
        {log.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {log.tags.map(({ tag }: { tag: { id: string; name: string; slug: string } }) => (
              <TagBadge key={tag.id} name={tag.name} slug={tag.slug} size="md" />
            ))}
          </div>
        )}

        {/* Workspace */}
        {log.workspace && (
          <p className="text-xs font-mono text-slate-600">
            📁 {log.workspace}
          </p>
        )}
      </div>

      <div className="gradient-divider" />

      {/* Content */}
      <div className="alog-card p-6 md:p-8">
        <MarkdownRenderer content={log.content} />
      </div>

      {/* View counter (fires POST on mount) */}
      <ViewCounter logId={log.id} />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-600 pb-8">
        <span className="flex items-center gap-3">
          <span>ID: {log.id}</span>
          {log.viewCount > 0 && (
            <span className="text-slate-600">👁 {log.viewCount} 次访问</span>
          )}
        </span>
        <span className="flex items-center gap-3">
          <LogActions logId={log.id} logType={log.type} />
          <Link
            href={`/${type}`}
            className="hover:text-[#00d4ff] transition-colors"
          >
            ← 返回列表
          </Link>
        </span>
      </div>
    </div>
  )
}
