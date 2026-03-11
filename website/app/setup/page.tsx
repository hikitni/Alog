'use client'

import { useState, useCallback } from 'react'

const RULES_VERSION = 'v2.0'

interface ApiKey {
  id: string
  name: string
  key: string
  source: string
  author: string
  createdAt: string
}

function KeyManager({ onSelectKey }: { onSelectKey: (key: string, source: string) => void }) {
  const [adminToken, setAdminToken] = useState('')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [newSource, setNewSource] = useState('cursor')
  const [newAuthor, setNewAuthor] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const fetchKeys = useCallback(async (token: string) => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/keys', { headers: { 'x-admin-token': token } })
      if (resp.status === 401) { setError('Admin Token 错误'); setKeys([]); return }
      const data = await resp.json()
      setKeys(data.apiKeys ?? [])
    } catch {
      setError('请求失败，请确认服务器正在运行')
    } finally {
      setLoading(false)
    }
  }, [])

  const createKey = async () => {
    if (!newName.trim() || !adminToken) return
    setCreating(true)
    try {
      const resp = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), source: newSource, author: newAuthor.trim() }),
      })
      const data = await resp.json()
      if (data.apiKey) {
        setKeys((prev) => [data.apiKey, ...prev])
        setNewName('')
        setNewAuthor('')
        // Auto-reveal new key
        setRevealed((prev) => ({ ...prev, [data.apiKey.id]: true }))
      }
    } finally {
      setCreating(false)
    }
  }

  const deleteKey = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/keys?id=${id}`, { method: 'DELETE', headers: { 'x-admin-token': adminToken } })
      setKeys((prev) => prev.filter((k) => k.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const SOURCE_COLORS: Record<string, string> = {
    cursor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    copilot: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    claude: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    windsurf: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  }
  const sourceColor = (s: string) => SOURCE_COLORS[s] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30'

  return (
    <div className="alog-card p-5 space-y-5">
      {/* Admin token input */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Admin Token</label>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="输入 .env 中的 ADMIN_TOKEN"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchKeys(adminToken)}
            className="flex-1 bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
          />
          <button
            onClick={() => fetchKeys(adminToken)}
            disabled={!adminToken || loading}
            className="px-4 py-2 text-sm font-mono rounded-md border border-[#00d4ff30] text-[#00d4ff] bg-[#00d4ff08] hover:bg-[#00d4ff15] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '加载中…' : '查看'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      </div>

      {/* Key list */}
      {keys.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">已有 API Keys ({keys.length})</p>
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-3 p-3 bg-[#080b14] border border-[#1e2d40] rounded-lg group">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#e2e8f0] font-medium truncate">{k.name}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${sourceColor(k.source)}`}>
                      {k.source}
                    </span>
                    {k.author && (
                      <span className="text-[10px] font-mono text-slate-500">{k.author}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-400 truncate">
                      {revealed[k.id] ? k.key : k.key.slice(0, 8) + '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setRevealed((prev) => ({ ...prev, [k.id]: !prev[k.id] }))}
                      className="text-[10px] text-slate-600 hover:text-slate-400 font-mono shrink-0"
                    >
                      {revealed[k.id] ? '隐藏' : '显示'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CopyButton text={k.key} label="复制" />
                  <button
                    onClick={() => onSelectKey(k.key, k.source)}
                    className="px-2 py-1 text-xs font-mono rounded border border-[#10b98130] text-[#10b981] hover:bg-[#10b98115] transition-all"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => deleteKey(k.id)}
                    disabled={deletingId === k.id}
                    className="px-2 py-1 text-xs font-mono rounded border border-[#ef444430] text-[#ef4444] hover:bg-[#ef444415] disabled:opacity-40 transition-all"
                  >
                    {deletingId === k.id ? '…' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create new key */}
      {adminToken && (
        <div className="space-y-2 pt-2 border-t border-[#1e2d40]">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">创建新 Key</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="名称，如 My Cursor Key"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
              className="flex-1 bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
            />
            <input
              type="text"
              placeholder="作者名（可选）"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="w-28 bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
            />
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] transition-colors"
            >
              <option value="cursor">cursor</option>
              <option value="copilot">copilot</option>
              <option value="claude">claude</option>
              <option value="windsurf">windsurf</option>
            </select>
            <button
              onClick={createKey}
              disabled={!newName.trim() || creating}
              className="px-4 py-2 text-sm font-mono rounded-md border border-[#10b98130] text-[#10b981] bg-[#10b98108] hover:bg-[#10b98115] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {creating ? '创建中…' : '+ 创建'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 动态生成内嵌凭证的规则文件内容（无需安装 Shell 函数）
function generateRulesContent(apiKey: string, server: string, source: string) {
  const key = apiKey || 'YOUR_API_KEY'
  const srv = server || 'http://your-server:3000'
  const src = source || 'unknown'

  return `# Alog 工作日志规则
<!-- rules-version: ${RULES_VERSION} -->

## 触发关键字

当用户说以下关键字时，必须立即执行对应操作，**无需确认**：

- \`生成alog日报\` → 生成工作日报并推送
- \`生成alog博客\` → 生成技术博客并推送

---

## 连接配置

- API Key: \`${key}\`
- Server: \`${srv}\`
- Source: \`${src}\`

---

## 生成alog日报

回顾本次对话完成的所有工作，构造 Markdown 内容，然后在终端执行：

> ⚠ **根据当前操作系统选择命令，不要混用**：Linux / Mac 执行 bash 命令；Windows 执行 PowerShell 命令。

**Linux / Mac：**
\`\`\`bash
curl -s -X POST ${srv}/api/logs \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -d "$(python3 -c "import json,datetime; print(json.dumps({'type':'daily','title':'日报 — '+str(datetime.date.today()),'content':'''## 今日完成任务\\n- （替换为实际内容）\\n\\n## 技术要点\\n- （关键决策）\\n\\n## 遇到的问题\\n- 无\\n\\n## 明日计划\\n- （下一步）''','source':'${src}','tags':'标签1,标签2'}))")" \\
  && echo "✅ 日报已发布到 Alog" || echo "❌ 发布失败"
\`\`\`

**Windows PowerShell：**
\`\`\`powershell
$c = "## 今日完成任务\`n- （替换为实际内容）\`n\`n## 技术要点\`n- （关键决策）\`n\`n## 遇到的问题\`n- 无\`n\`n## 明日计划\`n- （下一步）"
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="daily"; title="日报 — $(Get-Date -Format 'yyyy-MM-dd')"; content=$c; source="${src}"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "${srv}/api/logs" -Headers @{Authorization="Bearer ${key}"} -ContentType "application/json; charset=utf-8" -Body $b
\`\`\`

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个，用英文逗号分隔。

---

## 生成alog博客

提炼本次技术成果：

> ⚠ **根据当前操作系统选择命令，不要混用**：Linux / Mac 执行 bash 命令；Windows 执行 PowerShell 命令。

**Linux / Mac：**
\`\`\`bash
curl -s -X POST ${srv}/api/logs \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -d "$(python3 -c "import json; print(json.dumps({'type':'blog','title':'博客标题','content':'## 背景与目标\\n（问题描述）\\n\\n## 实现方案\\n（技术思路）\\n\\n## 关键实现\\n（代码示例）\\n\\n## 总结\\n（价值）','source':'${src}','tags':'标签1,标签2'}))")" \\
  && echo "✅ 博客已发布到 Alog" || echo "❌ 发布失败"
\`\`\`

**Windows PowerShell：**
\`\`\`powershell
$c = "## 背景与目标\`n（问题描述）\`n\`n## 实现方案\`n（技术思路）\`n\`n## 关键实现\`n（代码示例）\`n\`n## 总结\`n（价值）"
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="blog"; title="博客标题"; content=$c; source="${src}"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "${srv}/api/logs" -Headers @{Authorization="Bearer ${key}"} -ContentType "application/json; charset=utf-8" -Body $b
\`\`\`

---

**执行后**：终端输出 \`✅\` 表示成功，\`❌\` 表示请检查 API Key 和 Server 地址是否正确。
直接执行命令，不要向用户寻求确认。`
}

const AI_TOOLS = [
  {
    name: 'GitHub Copilot',
    icon: '🤖',
    color: 'border-[#238636]/40 bg-[#238636]/5',
    accent: '#238636',
    filePath: '.github/copilot-instructions.md',
    description: 'VS Code Copilot Chat 每次对话自动读取此文件',
    hint: '放到项目根目录的 .github/ 文件夹内，无需任何其他配置',
  },
  {
    name: 'Cursor',
    icon: '⚡',
    color: 'border-[#7c3aed]/40 bg-[#7c3aed]/5',
    accent: '#7c3aed',
    filePath: '.cursor/rules/alog.mdc',
    description: 'Cursor 自动加载 .cursor/rules/ 目录下所有 .mdc 规则文件',
    hint: '放到项目根目录的 .cursor/rules/ 文件夹，Cursor 会在每次对话时自动注入',
  },
  {
    name: 'Claude Code',
    icon: '🧠',
    color: 'border-[#d97706]/40 bg-[#d97706]/5',
    accent: '#d97706',
    filePath: 'CLAUDE.md',
    description: 'Claude Code 读取项目根目录的 CLAUDE.md 作为系统指令',
    hint: '直接放到项目根目录，Claude Code 启动时自动加载',
  },
  {
    name: 'Windsurf',
    icon: '🏄',
    color: 'border-[#00d4ff]/40 bg-[#00d4ff]/5',
    accent: '#00d4ff',
    filePath: '.windsurfrc',
    description: 'Windsurf 读取 .windsurfrc 文件作为全局规则',
    hint: '放到项目根目录，Windsurf 重启后自动生效',
  },
  {
    name: '通用 / System Prompt',
    icon: '🔧',
    color: 'border-[#64748b]/40 bg-[#64748b]/5',
    accent: '#64748b',
    filePath: 'system-prompt',
    description: '复制内容粘贴到任意 AI 工具的系统提示中',
    hint: '打开 AI 工具设置 → System Prompt → 粘贴内容保存即可',
  },
]

function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for non-secure contexts (plain HTTP on remote servers)
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        el.style.pointerEvents = 'none'
        document.body.appendChild(el)
        el.focus()
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // If all methods fail, silently ignore
    }
  }
  return (
    <button
      onClick={copy}
      className={`px-3 py-1 text-xs font-mono rounded border transition-all duration-200 ${
        copied
          ? 'border-[#10b981] text-[#10b981] bg-[#10b98115]'
          : 'border-[#1e2d40] text-slate-400 hover:border-[#00d4ff40] hover:text-[#00d4ff]'
      }`}
    >
      {copied ? '✓ 已复制' : label}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#080b14] border border-[#1e2d40] rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00d4ff15] border border-[#00d4ff30] text-[#00d4ff] text-xs font-mono font-bold shrink-0">
      {n}
    </span>
  )
}

export default function SetupPage() {
  const [apiKey, setApiKey] = useState('')
  const [server, setServer] = useState('http://your-server:3000')
  const [source, setSource] = useState('cursor')
  const [activeTool, setActiveTool] = useState(0)

  const isConfigured = apiKey.length > 0 && server.length > 0
  const rulesContent = generateRulesContent(apiKey, server, source)
  const selectedTool = AI_TOOLS[activeTool]

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="border-b border-[#1e2d40] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔌</span>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-mono tracking-wide">接入指南</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00d4ff12] border border-[#00d4ff30] text-[#00d4ff] select-none">rules-version: {RULES_VERSION}</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          只需 <strong className="text-[#00d4ff]">API Key</strong> + <strong className="text-[#00d4ff]">Server 地址</strong>，
          两步完成接入：配置凭证 → 复制规则文件到你的 AI 工具。无需安装任何 CLI 工具或 Shell 函数。
        </p>
      </div>

      {/* Step 1: Config */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={1} />
          <h2 className="text-lg font-semibold text-[#e2e8f0] font-mono">配置连接信息</h2>
        </div>

        <div className="alog-card p-5 space-y-5">
          {/* Config inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">API Key <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="alog_xxxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Server URL <span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="http://your-server:3000"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#080b14] border border-[#1e2d40] rounded-md px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-[#00d4ff40] focus:ring-1 focus:ring-[#00d4ff20] transition-colors"
              >
                <option value="cursor">cursor</option>
                <option value="copilot">copilot</option>
                <option value="claude">claude</option>
                <option value="windsurf">windsurf</option>
              </select>
            </div>
          </div>

          {/* Key Manager */}
          <div className="border-t border-[#1e2d40] pt-4 space-y-3">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">或从 Key 管理器选择</p>
            <KeyManager onSelectKey={(key, src) => { setApiKey(key); setSource(src) }} />
          </div>
        </div>
      </section>

      {/* Step 2: AI Tool Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={2} />
          <h2 className="text-lg font-semibold text-[#e2e8f0] font-mono">复制规则文件到 AI 工具</h2>
        </div>

        {!isConfigured && (
          <div className="flex items-center gap-2 p-3 bg-[#d9770610] border border-[#d9770630] rounded-lg text-sm text-[#d97706] font-mono">
            ⚠ 请先在上方填写 API Key 和 Server URL，规则文件将自动内嵌凭证
          </div>
        )}

        {/* Tool selector */}
        <div className="flex flex-wrap gap-2">
          {AI_TOOLS.map((tool, i) => (
            <button
              key={tool.name}
              onClick={() => setActiveTool(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono transition-all duration-200 ${
                activeTool === i
                  ? 'text-[#00d4ff] bg-[#00d4ff12] border-[#00d4ff30]'
                  : 'text-slate-400 border-[#1e2d40] hover:text-slate-200 hover:border-[#2e3d50]'
              }`}
            >
              <span>{tool.icon}</span>
              <span>{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Selected tool details */}
        <div className={`alog-card border ${selectedTool.color} space-y-4 p-5`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedTool.icon}</span>
                <h3 className="font-semibold text-[#e2e8f0] font-mono">{selectedTool.name}</h3>
              </div>
              <p className="text-xs text-slate-500">{selectedTool.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {selectedTool.filePath !== 'system-prompt' && (
                <code className="text-xs font-mono px-2 py-1 bg-[#080b14] border border-[#1e2d40] rounded text-slate-400">
                  {selectedTool.filePath}
                </code>
              )}
              <CopyButton text={rulesContent} label="📋 复制规则内容" />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#00d4ff08] border border-[#00d4ff20] rounded-lg">
            <span className="text-[#00d4ff] text-sm mt-0.5 shrink-0">💡</span>
            <p className="text-xs text-slate-400 leading-relaxed">{selectedTool.hint}</p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                规则文件预览{isConfigured ? <span className="ml-2 text-[#10b981]">✓ 已内嵌凭证</span> : <span className="ml-2 text-slate-600">（填写凭证后自动填充）</span>}
              </p>
            </div>
            <CodeBlock code={rulesContent} />
          </div>
        </div>
      </section>

      {/* Quick verify */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-400 font-mono flex items-center gap-2">
          <span className="text-slate-600">//</span> 快速验证
        </h2>
        <div className="alog-card p-4 space-y-3">
          <p className="text-slate-500 text-xs">配置完成后，直接在终端执行以下命令验证连通性：</p>
          <CodeBlock code={`# curl
curl -s -X POST ${server || 'http://your-server:3000'}/api/logs \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -d '{"type":"daily","content":"## 测试\\n- Alog 接入验证","source":"${source}","tags":"test"}' | python3 -m json.tool

# PowerShell
$b=[System.Text.Encoding]::UTF8.GetBytes('{"type":"daily","content":"## 测试\\n- Alog 接入验证","source":"${source}","tags":"test"}')
Invoke-RestMethod -Method Post -Uri "${server || 'http://your-server:3000'}/api/logs" -Headers @{Authorization="Bearer ${apiKey || 'YOUR_API_KEY'}"} -ContentType "application/json; charset=utf-8" -Body $b`} />
        </div>
      </section>
    </div>
  )
}


