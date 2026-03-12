import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerPushLog } from './tools/push-log.js'
import { registerSearchLogs } from './tools/search-logs.js'
import { registerGetLog } from './tools/get-log.js'
import { registerUpdateLog } from './tools/update-log.js'
import { registerDeleteLog } from './tools/delete-log.js'
import { registerGetTags } from './tools/get-tags.js'
import { registerGetAuthors } from './tools/get-authors.js'
import { registerResources } from './resources/index.js'
import { registerPrompts } from './prompts/index.js'

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'alog-mcp',
    version: '1.0.0',
  })

  // Tools
  registerPushLog(server)
  registerSearchLogs(server)
  registerGetLog(server)
  registerUpdateLog(server)
  registerDeleteLog(server)
  registerGetTags(server)
  registerGetAuthors(server)

  // Resources
  registerResources(server)

  // Prompts
  registerPrompts(server)

  return server
}
