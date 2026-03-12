import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { updateLog } from '../client.js'

export function registerUpdateLog(server: McpServer) {
  server.tool(
    'update_log',
    '编辑已有日志的标题、正文或标签。需要提供日志 ID，仅提供需要修改的字段。需要 ALOG_API_KEY 权限。',
    {
      id: z.string().uuid().describe('要编辑的日志 UUID'),
      title: z.string().optional().describe('新标题（不填则不修改）'),
      content: z.string().optional().describe('新的 Markdown 正文（不填则不修改）'),
      tags: z.string().optional().describe('新标签，逗号分隔（不填则不修改）'),
    },
    async ({ id, title, content, tags }) => {
      if (!title && !content && !tags) {
        return {
          content: [{ type: 'text', text: '❌ 请至少提供一个要修改的字段（title、content 或 tags）' }],
          isError: true,
        }
      }
      try {
        const { log } = await updateLog(id, { title, content, tags })
        return {
          content: [
            {
              type: 'text',
              text: `✅ 日志更新成功\n标题：${log.title}\nID：${log.id}`,
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 更新失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
