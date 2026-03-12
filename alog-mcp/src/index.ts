#!/usr/bin/env node
/**
 * alog-mcp — MCP Server for Alog Work Log System
 *
 * Supported Tools:
 *   push_log      — Write daily log or blog post
 *   search_logs   — Full-text search and filter logs
 *   get_log       — Get single log by ID
 *   update_log    — Edit an existing log
 *   delete_log    — Delete a log permanently
 *   get_tags      — List all tags with counts
 *   get_authors   — List all authors with stats
 *
 * Resources:
 *   alog://logs/recent  — Recent 20 logs
 *   alog://logs/{id}    — Single log content
 *   alog://tags         — All tags
 *   alog://authors      — All authors
 *
 * Prompts:
 *   write_daily_log   — Generate and push a daily log
 *   write_blog_post   — Extract and push a blog post
 *
 * Usage (stdio — for Claude Desktop / Cursor):
 *   npx alog-mcp
 *
 * Environment Variables:
 *   ALOG_SERVER_URL   Alog server address (default: http://localhost:3000)
 *   ALOG_API_KEY      API key for write operations
 *   ALOG_SOURCE       Source label (default: mcp)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server.js'

async function main() {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write('[alog-mcp] Server started (stdio transport)\n')
}

main().catch((err) => {
  process.stderr.write(`[alog-mcp] Fatal error: ${err}\n`)
  process.exit(1)
})
