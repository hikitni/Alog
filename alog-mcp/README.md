# alog-mcp

MCP（Model Context Protocol）Server for [Alog](https://github.com/your-org/alog) — 让 AI 工具直接读写你的工作日志。

## 功能

| Tool | 说明 |
|------|------|
| `push_log` | 写入日报或技术博客 |
| `search_logs` | 全文检索 + 多条件筛选 |
| `get_log` | 读取单条日志完整内容 |
| `update_log` | 编辑标题 / 正文 / 标签 |
| `delete_log` | 永久删除日志 |
| `get_tags` | 获取所有标签列表 |
| `get_authors` | 获取所有作者统计 |

| Resource | URI | 说明 |
|----------|-----|------|
| 最近日志 | `alog://logs/recent` | 最新 20 条摘要 |
| 单条日志 | `alog://logs/{id}` | 完整正文 |
| 标签列表 | `alog://tags` | 含数量 |
| 作者列表 | `alog://authors` | 含统计 |

| Prompt | 说明 |
|--------|------|
| `write_daily_log` | 生成日报并写入 |
| `write_blog_post` | 提炼博客并写入 |

## 接入 Claude Desktop

编辑 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）或  
`~/Library/Application Support/Claude/claude_desktop_config.json`（Mac）：

```json
{
  "mcpServers": {
    "alog": {
      "command": "npx",
      "args": ["-y", "alog-mcp"],
      "env": {
        "ALOG_SERVER_URL": "http://your-server:3000",
        "ALOG_API_KEY": "alog_xxxx",
        "ALOG_SOURCE": "claude-desktop"
      }
    }
  }
}
```

重启 Claude Desktop 即可。

## 接入 Cursor

在项目 `.cursor/mcp.json`（或全局配置）中添加同样配置。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `ALOG_SERVER_URL` | 是 | Alog 服务地址，如 `http://hiki.site:3001` |
| `ALOG_API_KEY` | 是（写操作） | API Key，在 `/setup` 页面创建 |
| `ALOG_SOURCE` | 否 | 来源标识，默认 `mcp` |

## 本地开发

```bash
git clone https://github.com/your-org/alog
cd alog/alog-mcp
npm install
npm run build

# 测试运行
ALOG_SERVER_URL=http://localhost:3000 ALOG_API_KEY=alog_xxx node dist/index.js
```

## License

MIT
