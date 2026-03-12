# 第十二章：MCP 接入（推荐方案）

## 12.1 什么是 MCP

MCP（Model Context Protocol）是 Anthropic 于 2024 年末提出的开放协议，让 AI 模型以标准化方式与外部工具和数据源交互。

`alog-mcp` 是 Alog 的官方 MCP Server，基于 `@modelcontextprotocol/sdk` 实现，支持 Claude Desktop、Cursor、GitHub Copilot 等任意支持 MCP 的 AI 客户端接入。

与传统 Shell 脚本方案相比，MCP 方案的优势：

| 维度 | Shell 脚本方案 | MCP 方案 |
|------|--------------|---------|
| 触发方式 | 用户手动输入关键字 | AI 自主决策调用 |
| 上下文感知 | 无 | 有（AI 读取对话历史自动生成） |
| 跨平台 | 需分别适配 bash / PowerShell | 统一 JSON-RPC，无 Shell 依赖 |
| 数据读取 | 不支持 | Resource 支持查看历史日志 |
| 接入成本 | 低（脚本配置一次） | 中（配置 JSON 一次） |

---

## 12.2 架构

```
AI 客户端（Claude Desktop / Cursor / Copilot）
        │
        │  MCP 协议（JSON-RPC 2.0，stdio 传输）
        ↓
  alog-mcp（Node.js 子进程）
  ├── Tools：push_log / search_logs / get_log / update_log / delete_log / get_tags / get_authors
  ├── Resources：alog://logs/recent · alog://logs/{id} · alog://tags · alog://authors
  └── Prompts：write_daily_log · write_blog_post
        │
        │  HTTP REST 调用
        ↓
  Alog REST API（POST /api/logs，GET /api/logs，…）
        │
        ↓
  SQLite 数据库
```

---

## 12.3 Tools 列表

| Tool | 权限 | 说明 |
|------|------|------|
| `push_log` | API Key | 写入日报或技术博客（Markdown） |
| `search_logs` | 公开 | 全文检索 + 多条件筛选（关键字、类型、作者、标签、日期范围） |
| `get_log` | 公开 | 根据 ID 读取单条日志完整内容 |
| `update_log` | API Key | 编辑已有日志的标题、正文或标签 |
| `delete_log` | API Key | 永久删除日志（需 `confirm: "yes"` 防误操作） |
| `get_tags` | 公开 | 获取所有标签及数量 |
| `get_authors` | 公开 | 获取所有作者统计信息 |

---

## 12.4 Resources 列表

| URI | 说明 |
|-----|------|
| `alog://logs/recent` | 最近 20 条日志摘要（标题 + 时间 + 标签） |
| `alog://logs/{id}` | 指定日志完整正文 |
| `alog://tags` | 所有标签列表（含数量） |
| `alog://authors` | 所有作者统计 |

---

## 12.5 Prompts 列表

| Prompt | 参数 | 说明 |
|--------|------|------|
| `write_daily_log` | `date?`, `tags?` | 引导 AI 生成日报并调用 `push_log` |
| `write_blog_post` | `title?`, `tags?` | 引导 AI 提炼技术博客并调用 `push_log` |

---

## 12.6 接入 Claude Desktop

**第一步：** 在 Alog `/setup` 页面创建 API Key。

**第二步：** 编辑 Claude Desktop 配置文件：

- Windows：`%APPDATA%\Claude\claude_desktop_config.json`
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`

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

**第三步：** 重启 Claude Desktop，即可在对话中直接调用所有 Tool。

---

## 12.7 接入 Cursor

在项目根目录创建 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "alog": {
      "command": "npx",
      "args": ["-y", "alog-mcp"],
      "env": {
        "ALOG_SERVER_URL": "http://your-server:3000",
        "ALOG_API_KEY": "alog_xxxx",
        "ALOG_SOURCE": "cursor"
      }
    }
  }
}
```

---

## 12.8 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `ALOG_SERVER_URL` | 是 | `http://localhost:3000` | Alog 服务地址 |
| `ALOG_API_KEY` | 写操作必填 | — | 在 `/setup` 页面 Key 管理器创建 |
| `ALOG_SOURCE` | 否 | `mcp` | 来源标识，写入日志的 source 字段 |

---

## 12.9 本地开发调试

```bash
# 克隆项目并进入 mcp 目录
cd alog/alog-mcp

# 安装依赖
npm install

# 构建
npm run build

# 本地运行（stdio 模式，测试用）
ALOG_SERVER_URL=http://localhost:3000 ALOG_API_KEY=alog_xxx node dist/index.js

# 重新发布到 npm
npm version patch   # 更新版本号
npm publish
```

---

## 12.10 目录结构

```
alog-mcp/
├── package.json          # npm 包配置，bin: alog-mcp
├── tsconfig.json         # TypeScript 配置
├── README.md             # npm 页面说明
├── src/
│   ├── index.ts          # 入口：stdio 传输层
│   ├── server.ts         # McpServer 汇总注册
│   ├── config.ts         # 环境变量读取
│   ├── client.ts         # Alog REST API 封装
│   ├── tools/
│   │   ├── push-log.ts
│   │   ├── search-logs.ts
│   │   ├── get-log.ts
│   │   ├── update-log.ts
│   │   ├── delete-log.ts
│   │   ├── get-tags.ts
│   │   └── get-authors.ts
│   ├── resources/
│   │   └── index.ts      # 4 个 Resource URI 注册
│   └── prompts/
│       └── index.ts      # 2 个 Prompt 模板注册
└── dist/
    └── index.js          # 构建产物（tsup 编译）
```
