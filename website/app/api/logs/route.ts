import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// GET /api/logs — list logs with search & pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')
  const tag    = searchParams.get('tag')
  const q      = searchParams.get('q')?.trim() || null
  const author = searchParams.get('author')?.trim() || null
  const from   = searchParams.get('from')
  const to     = searchParams.get('to')
  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20')))
  // Backward compat: `limit` param bypasses pagination
  const limitParam = searchParams.get('limit')

  const where = {
    AND: [
      type   ? { type }   : {},
      author ? { author } : {},
      tag    ? { tags: { some: { tag: { slug: tag } } } } : {},
      from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to + 'T23:59:59.999Z') } : {}),
        },
      } : {},
      q ? {
        OR: [
          { title:   { contains: q } },
          { content: { contains: q } },
          { tags: { some: { tag: { name: { contains: q } } } } },
        ],
      } : {},
    ],
  }

  // Legacy: limit param returns flat list without pagination metadata
  if (limitParam) {
    const logs = await prisma.log.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limitParam),
    })
    return NextResponse.json({ logs })
  }

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.log.count({ where }),
  ])

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

// POST /api/logs — create log
export async function POST(req: NextRequest) {
  // Verify API key
  const authHeader = req.headers.get('authorization')
  const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }

  const keyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } })
  if (!keyRecord) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  let body: {
    type?: string
    title?: string
    content?: string
    source?: string
    workspace?: string
    tags?: string | string[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, title, content, source, workspace, tags } = body

  if (!type || !['daily', 'blog'].includes(type)) {
    return NextResponse.json({ error: 'type must be daily or blog' }, { status: 400 })
  }
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  // Parse tags: accept comma-separated string or array
  const rawTags: string[] = Array.isArray(tags)
    ? tags
    : (tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean)

  // Generate title from content if not provided (daily reports)
  const finalTitle = title?.trim() || 
    (type === 'daily'
      ? `日报 — ${new Date().toLocaleDateString('zh-CN')}`
      : content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60) || '无标题博客')

  // Upsert tags and create log
  const log = await prisma.log.create({
    data: {
      type,
      title: finalTitle,
      content: content.trim(),
      source: source ?? keyRecord.source ?? 'unknown',
      author: keyRecord.author ?? '',
      workspace: workspace ?? '',
      apiKeyId: keyRecord.id,
      tags: {
        create: await Promise.all(
          rawTags.map(async (name) => {
            const slug = slugify(name) || name.toLowerCase()
            const tag = await prisma.tag.upsert({
              where: { slug },
              update: {},
              create: { name, slug },
            })
            return { tagId: tag.id }
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json({ success: true, log }, { status: 201 })
}
