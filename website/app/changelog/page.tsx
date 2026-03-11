import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export const metadata = {
  title: '更新日志 | Alog',
  description: 'Alog 版本更新历史记录',
}

// 读取 CHANGELOG.md（在 website/ 上一级目录）
function getChangelog(): string {
  const filePath = path.join(process.cwd(), '..', 'CHANGELOG.md')
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return '# Changelog\n\n暂无更新记录。'
  }
}

export default function ChangelogPage() {
  const content = getChangelog()

  // 提取最新版本号（格式：## [x.y.z] - YYYY-MM-DD）
  const latestMatch = content.match(/##\s+\[([^\]]+)\]/)
  const latestVersion = latestMatch ? latestMatch[1] : null

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* 页头 */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⏳</span>
          <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--text-primary)' }}>
            更新日志
          </h1>
          {latestVersion && (
            <span
              className="text-xs font-mono px-2.5 py-1 rounded-full border mt-1"
              style={{
                color: 'var(--accent)',
                borderColor: 'rgba(var(--accent-rgb),0.3)',
                background: 'rgba(var(--accent-rgb),0.08)',
              }}
            >
              最新 v{latestVersion}
            </span>
          )}
        </div>
        <p className="text-sm ml-10" style={{ color: 'var(--text-muted)' }}>
          记录每个版本的功能新增、修改与修复。
        </p>
        <div className="gradient-divider mt-6" />
      </div>

      {/* Changelog 内容 */}
      <div className="changelog-body">
        <MarkdownRenderer content={content} />
      </div>
    </main>
  )
}
