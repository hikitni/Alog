import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { listLogs, getTags, getAuthors, getLog } from '../client.js'

export function registerResources(server: McpServer) {
  // Recent 20 logs summary
  server.resource('recent-logs', 'alog://logs/recent', async () => {
    const { logs, total } = await listLogs({ pageSize: 20 })
    const lines = [
      `Alog 最近日志（共 ${total} 条）`,
      '',
      ...logs.map((l) => {
        const tags = l.tags.map((t) => t.tag.name).join(', ')
        return [
          `[${l.type.toUpperCase()}] ${l.title}`,
          `  ID: ${l.id} | ${l.createdAt.slice(0, 10)} | 作者: ${l.author || '未知'}`,
          tags ? `  标签: ${tags}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      }),
    ]
    return {
      contents: [{ uri: 'alog://logs/recent', mimeType: 'text/plain', text: lines.join('\n') }],
    }
  })

  // All tags
  server.resource('tags', 'alog://tags', async () => {
    const { tags } = await getTags()
    const text = tags.map((t) => `${t.name} (${t.slug}): ${t.count} 条`).join('\n')
    return {
      contents: [{ uri: 'alog://tags', mimeType: 'text/plain', text: text || '暂无标签' }],
    }
  })

  // Authors
  server.resource('authors', 'alog://authors', async () => {
    const { authors } = await getAuthors()
    const text = authors
      .map((a) => `${a.name || '匿名'} (${a.source}): ${a.logCount} 条`)
      .join('\n')
    return {
      contents: [{ uri: 'alog://authors', mimeType: 'text/plain', text: text || '暂无作者' }],
    }
  })

  // Single log by ID (dynamic resource template)
  server.resource(
    'log-by-id',
    new ResourceTemplate('alog://logs/{id}', { list: undefined }),
    async (uri, { id }) => {
      const logId = Array.isArray(id) ? id[0] : id
      if (!logId) throw new Error('Missing log ID in URI')
      const { log } = await getLog(logId)
      const tags = log.tags.map((t) => t.tag.name).join(', ')
      const text = [
        `# ${log.title}`,
        `类型: ${log.type} | 时间: ${log.createdAt.slice(0, 10)} | 阅读: ${log.viewCount}`,
        tags ? `标签: ${tags}` : '',
        '',
        log.content,
      ]
        .filter((l) => l !== undefined)
        .join('\n')
      return {
        contents: [{ uri: uri.href, mimeType: 'text/plain', text }],
      }
    }
  )
}
