/**
 * alog-mcp — Configuration loaded from environment variables
 */
export const config = {
  serverUrl: (process.env.ALOG_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  apiKey: process.env.ALOG_API_KEY ?? '',
  source: process.env.ALOG_SOURCE ?? 'mcp',
}

if (!config.apiKey) {
  process.stderr.write(
    '[alog-mcp] Warning: ALOG_API_KEY is not set. Write operations (push_log, update_log, delete_log) will fail.\n'
  )
}
