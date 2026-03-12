import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { listLogs } from '../client.js'

export function registerSearchLogs(server: McpServer) {
  server.tool(
    'search_logs',
    '全文检索和筛选 Alog 日志，支持关键字、类型、作者、标签、时间范围等多维度查询。',
    {
      q: z.string().optional().describe('关键字搜索，匹配标题、正文和标签'),
      type: z.enum(['daily', 'blog']).optional().describe('日志类型筛选'),
      author: z.string().optional().describe('按作者名称精确筛选'),
      tag: z.string().optional().describe('按标签 slug 精确筛选，如 "typescript"'),
      from: z.string().optional().describe('开始日期 YYYY-MM-DD'),
      to: z.string().optional().describe('结束日期 YYYY-MM-DD'),
      page: z.number().int().min(1).optional().default(1).describe('页码，从 1 起'),
      pageSize: z.number().int().min(1).max(50).optional().default(10).describe('每页数量，最大 50'),
    },
    async ({ q, type, author, tag, from, to, page, pageSize }) => {
      try {
        const params: Record<string, string | number> = { page: page ?? 1, pageSize: pageSize ?? 10 }
        if (q) params.q = q
        if (type) params.type = type
        if (author) params.author = author
        if (tag) params.tag = tag
        if (from) params.from = from
        if (to) params.to = to

        const data = await listLogs(params)

        if (data.logs.length === 0) {
          return { content: [{ type: 'text', text: '未找到匹配的日志' }] }
        }

        const lines = [
          `共 ${data.total} 条记录（第 ${data.page}/${data.totalPages} 页）`,
          '',
          ...data.logs.map((log, i) => {
            const tags = log.tags.map((t) => t.tag.name).join(', ')
            return [
              `${i + 1}. [${log.type.toUpperCase()}] ${log.title}`,
              `   ID: ${log.id}`,
              `   作者: ${log.author || '未知'} | 时间: ${log.createdAt.slice(0, 10)}`,
              tags ? `   标签: ${tags}` : '',
            ]
              .filter(Boolean)
              .join('\n')
          }),
        ]

        return { content: [{ type: 'text', text: lines.join('\n') }] }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 查询失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
