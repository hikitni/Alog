import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// GET /api/logs/[id] — get single log
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const log = await prisma.log.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })
  if (!log) return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  return NextResponse.json({ log })
}

// Shared auth: accept Admin Token or any valid API Key
async function verifyToken(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-token')
  if (!token) return false
  if (token === process.env.ADMIN_TOKEN) return true
  const keyRecord = await prisma.apiKey.findUnique({ where: { key: token } })
  return !!keyRecord
}

// PATCH /api/logs/[id] — edit log
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: { title?: string; content?: string; tags?: string; type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, content, tags, type } = body

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }
  if (type && !['daily', 'blog'].includes(type)) {
    return NextResponse.json({ error: 'type must be daily or blog' }, { status: 400 })
  }

  // Parse tags
  const rawTags: string[] = (tags ?? '').split(',').map((t) => t.trim()).filter(Boolean)

  try {
    // Delete existing tag relations
    await prisma.logTag.deleteMany({ where: { logId: id } })

    // Upsert tags and update log
    const log = await prisma.log.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        ...(type ? { type } : {}),
        tags: {
          create: await Promise.all(
            rawTags.map(async (name) => {
              const slug = slugify(name)
              const tag = await prisma.tag.upsert({
                where: { slug },
                create: { name, slug },
                update: {},
              })
              return { tag: { connect: { id: tag.id } } }
            })
          ),
        },
      },
      include: { tags: { include: { tag: true } } },
    })
    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }
}

// DELETE /api/logs/[id] — delete log
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.logTag.deleteMany({ where: { logId: id } })
    const log = await prisma.log.delete({ where: { id } })
    return NextResponse.json({ success: true, type: log.type })
  } catch {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }
}
