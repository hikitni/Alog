'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { TokenGate, getCachedToken } from '@/components/TokenGate'

interface Log {
  id: string
  type: string
  title: string
  content: string
  tags: { tag: { id: string; name: string; slug: string } }[]
}

interface EditFormProps {
  log: Log
}

export default function EditForm({ log }: EditFormProps) {
  const router = useRouter()
  const [type, setType] = useState(log.type)
  const [title, setTitle] = useState(log.title)
  const [content, setContent] = useState(log.content)
  const [tags, setTags] = useState(log.tags.map((t) => t.tag.name).join(', '))
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showGate, setShowGate] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check for cached token on mount
  useEffect(() => {
    const cached = getCachedToken()
    if (cached) setToken(cached)
  }, [])

  const handleSave = async () => {
    if (!token) { setShowGate(true); return }
    doSave(token)
  }

  const doSave = async (tok: string) => {
    if (!title.trim()) { setError('标题不能为空'); return }
    if (!content.trim()) { setError('内容不能为空'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/logs/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-token': tok },
        body: JSON.stringify({ title, content, tags, type }),
      })
      if (res.ok) {
        router.push(`/${type}/${log.id}`)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? '保存失败')
        if (res.status === 401) setToken(null)
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {showGate && (
        <TokenGate
          onVerified={(tok) => { setToken(tok); setShowGate(false); doSave(tok) }}
          onCancel={() => setShowGate(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/${log.type}/${log.id}`}
          className="text-[var(--text-muted)] hover:text-[var(--accent)] text-sm font-mono transition-colors"
        >
          ← 取消
        </Link>
        <h1 className="text-base font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
          ✏️ 编辑日志
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-3 py-1.5 rounded-md text-xs font-mono transition-colors"
            style={{
              background: preview ? '#00d4ff20' : '#ffffff08',
              border: `1px solid ${preview ? '#00d4ff50' : '#1e2d40'}`,
              color: preview ? '#00d4ff' : '#94a3b8',
            }}
          >
            {preview ? '编辑' : '预览'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-colors disabled:opacity-50"
            style={{
              background: '#00d4ff20',
              border: '1px solid #00d4ff50',
              color: '#00d4ff',
            }}
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm"
          style={{ background: '#f8717120', border: '1px solid #f8717140', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Metadata row */}
      <div className="flex gap-3 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-md text-sm font-mono outline-none"
          style={{ background: '#0f1629', border: '1px solid #1e2d40', color: '#e2e8f0' }}
        >
          <option value="daily">📅 日报</option>
          <option value="blog">📝 博客</option>
        </select>
        <input
          type="text"
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm font-mono outline-none focus:ring-1"
          style={{ background: '#0f1629', border: '1px solid #1e2d40', color: '#e2e8f0' }}
        />
        <input
          type="text"
          placeholder="标签（逗号分隔）"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-64 px-3 py-2 rounded-md text-sm font-mono outline-none"
          style={{ background: '#0f1629', border: '1px solid #1e2d40', color: '#e2e8f0' }}
        />
      </div>

      {/* Editor / Preview split */}
      <div className={`grid gap-4 ${preview ? 'grid-cols-2' : 'grid-cols-1'}`}
        style={{ height: 'calc(100vh - 260px)' }}>
        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Markdown 内容..."
          className="w-full h-full resize-none p-4 rounded-lg text-sm font-mono outline-none"
          style={{
            background: '#060a14',
            border: '1px solid #1e2d40',
            color: '#e2e8f0',
            lineHeight: 1.7,
          }}
        />

        {/* Preview panel */}
        {preview && (
          <div className="alog-card p-6 overflow-y-auto">
            <MarkdownRenderer content={content || '*（预览区）*'} />
          </div>
        )}
      </div>
    </div>
  )
}
