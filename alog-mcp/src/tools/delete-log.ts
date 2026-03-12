import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { deleteLog } from '../client.js'

export function registerDeleteLog(server: McpServer) {
  server.tool(
    'delete_log',
    '永久删除指定日志。此操作不可撤销，请谨慎使用。需要 ALOG_API_KEY 权限。',
    {
      id: z.string().uuid().describe('要删除的日志 UUID'),
      confirm: z
        .literal('yes')
        .describe('确认删除，必须传入字符串 "yes" 以防止误操作'),
    },
    async ({ id, confirm }) => {
      if (confirm !== 'yes') {
        return {
          content: [{ type: 'text', text: '❌ 请将 confirm 参数设置为 "yes" 以确认删除' }],
          isError: true,
        }
      }
      try {
        await deleteLog(id)
        return {
          content: [{ type: 'text', text: `✅ 日志 ${id} 已永久删除` }],
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 删除失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
