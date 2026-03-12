import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getAuthors } from '../client.js'

export function registerGetAuthors(server: McpServer) {
  server.tool(
    'get_authors',
    '获取所有作者及其日志统计信息（总数、日报数、博客数）。',
    {},
    async () => {
      try {
        const { authors } = await getAuthors()
        if (authors.length === 0) {
          return { content: [{ type: 'text', text: '暂无作者数据' }] }
        }
        const lines = authors.map(
          (a) =>
            `• ${a.name || '匿名'} (${a.source}) — 共 ${a.logCount} 条，日报 ${a.dailyCount}，博客 ${a.blogCount}`
        )
        return {
          content: [
            {
              type: 'text',
              text: `共 ${authors.length} 位作者：\n\n${lines.join('\n')}`,
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 获取作者失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
