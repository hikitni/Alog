import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getTags } from '../client.js'

export function registerGetTags(server: McpServer) {
  server.tool(
    'get_tags',
    '获取所有标签列表及每个标签的日志数量，可用于推荐标签或了解知识分布。',
    {},
    async () => {
      try {
        const { tags } = await getTags()
        if (tags.length === 0) {
          return { content: [{ type: 'text', text: '暂无标签' }] }
        }
        const lines = tags.map(
          (t) => `• ${t.name} (${t.slug}) — ${t.count} 条日志`
        )
        return {
          content: [
            {
              type: 'text',
              text: `共 ${tags.length} 个标签：\n\n${lines.join('\n')}`,
            },
          ],
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `❌ 获取标签失败：${(err as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
