import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getLog } from '../client.js'

export function registerGetLog(server: McpServer) {
  server.tool(
    'get_log',
    '根据 ID 获取单条日志的完整内容（包含正文、标签、元数据）。',
    {
      id: z.string().uuid().describe('日志 UUID，可通过 search_logs 获取'),
    },
    async ({ id }) => {
      try {
        const { log } = await getLog(id)
        const tags = log.tags.map((t) => t.tag.name).join(', ')
        const text = [
          `# ${log.title}`,
          `类型: ${log.type} | 作者: ${log.author || '未知'} | 来源: ${log.source}`,
          `时间: ${log.createdAt.slice(0, 10)} | 阅读: ${log.viewCount}`,
          tags ? `标签: ${tags}` : '',
          '',
          '---',
          '',
          log.content,
        ]
          .filter((l) => l !== undefined)
          .join('\n')

        return { content: [{ type: 'text', text }] }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 获取失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
