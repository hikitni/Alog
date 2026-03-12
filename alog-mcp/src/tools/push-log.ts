import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { pushLog } from '../client.js'

export function registerPushLog(server: McpServer) {
  server.tool(
    'push_log',
    '将日报（daily）或博客（blog）写入 Alog 工作日志系统。content 使用 Markdown 格式。',
    {
      type: z.enum(['daily', 'blog']).describe('日志类型：daily=日报，blog=技术博客'),
      content: z.string().min(1).describe('Markdown 正文内容'),
      title: z.string().optional().describe('标题，不填时系统自动生成'),
      tags: z.string().optional().describe('逗号分隔的标签，如 "TypeScript,React,MCP"'),
      workspace: z.string().optional().describe('当前工作区路径，如 "D:/my-project"'),
    },
    async ({ type, content, title, tags, workspace }) => {
      try {
        const data = await pushLog({ type, content, title, tags, workspace })
        return {
          content: [
            {
              type: 'text',
              text: `✅ 日志写入成功\n标题：${data.log.title}\nID：${data.log.id}\n类型：${data.log.type}`,
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 写入失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
