<div align="center">

# ALOG

**AI Work Log — AI 编程工具任务日志聚合平台**

让每一次 AI 辅助编程的工作，都留下可追溯的记录

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-Prisma_7-003b57?logo=sqlite&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

</div>

---

## 什么是 Alog？

Alog 是一个轻量级的 AI 工作日志平台。当你和 AI（Copilot、Cursor、Claude 等）一起完成某项开发工作之后，只需对 AI 说一句「**生成alog日报**」，AI 就会自动整理本次对话内容，生成结构化日志并推送到你的 Alog 服务器，永久保存可随时回溯。

```
你对 AI 说：生成alog日报
         ↓
AI 整理对话，生成结构化 Markdown
         ↓
自动 POST 到你的 Alog 服务器
         ↓
在 Alog 网站查看、搜索、管理所有日志
```

---

## ✨ 功能特性

- 📋 **多工具来源** — 支持 GitHub Copilot、Cursor、Claude Code、Windsurf 等主流 AI 工具，每个工具独立 API Key
- 📅 **两种日志类型** — 工作日报（daily）+ 技术博客（blog），按类型分类展示
- 🏷️ **标签系统** — 自动提取标签，按技术栈/功能模块归类，支持标签页聚合浏览
- 👤 **多作者支持** — 团队多人共用同一平台，每个 API Key 绑定作者信息，按作者筛选
- ✍️ **在线编辑** — 日志支持编辑与删除，Markdown 实时预览，Token 鉴权保护
- 📊 **浏览统计** — 每篇日志记录访问次数（viewCount）
- 📝 **更新日志页** — 内置 `/changelog` 页面，自动读取 `CHANGELOG.md` 展示版本历史
- 🔐 **API Key 管理器** — 可视化创建/查看/删除 Key，支持显示/隐藏/一键复制
- ⚡ **零安装接入** — 规则文件内嵌完整推送命令（Linux/Mac + Windows 双版本），无需安装任何 CLI

---

## 🚀 快速开始

### 必要条件

- Node.js 18+
- Git

### 1. 克隆项目

```bash
git clone https://github.com/2634213728/Alog.git
cd Alog
```

### 2. 安装依赖 & 初始化数据库

```bash
cd website
npm install
# 数据库在首次 dev/build 时自动创建（SQLite）
```

### 3. 配置环境变量

```bash
# website/.env
cp .env.example .env  # 如果有示例文件
# 或手动创建：
echo 'DATABASE_URL="file:../../data/alog.db"' > .env
echo 'ADMIN_TOKEN="your-admin-token"' >> .env
```

### 4. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

### 5. 接入 AI 工具

访问 `http://localhost:3000/setup`，按页面提示两步完成接入：

1. **配置凭证** — 输入 Admin Token 查看/创建 API Key，填写 Server 地址
2. **复制规则文件** — 选择你的 AI 工具，复制生成的规则内容，粘贴到工具对应路径

之后对 AI 说：

```
生成alog日报    # 推送当次对话的工作摘要
生成alog博客    # 推送当次对话的技术文章
```

---

## 🛠️ 技术栈

| 层次 | 技术选型 |
|------|----------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript（strict mode）|
| 样式 | Tailwind CSS v4 |
| 数据库 | SQLite + Prisma 7 |
| SQLite 驱动 | better-sqlite3 |
| 运行时 | Node.js 18+ |
| 进程管理 | PM2 |
| 反向代理 | Nginx（推荐）|

---

## 📁 项目结构

```
Alog/
├── website/                   # Next.js 主应用
│   ├── app/
│   │   ├── api/
│   │   │   ├── logs/          # 日志 CRUD（GET/POST/PATCH/DELETE）
│   │   │   ├── logs/[id]/     # 单条日志操作（含 view 计数）
│   │   │   ├── keys/          # API Key 管理
│   │   │   ├── tags/          # 标签查询
│   │   │   ├── authors/       # 作者查询
│   │   │   └── auth/verify/   # Token 验证（Admin Token or API Key）
│   │   ├── [type]/[id]/       # 日志详情页
│   │   ├── edit/[id]/         # 日志编辑页（Markdown 实时预览）
│   │   ├── setup/             # 接入引导页（Key Manager + 规则生成）
│   │   ├── changelog/         # 更新日志展示页
│   │   ├── tags/              # 标签列表页
│   │   └── authors/           # 作者列表页
│   ├── components/
│   │   ├── Header.tsx         # 导航栏
│   │   ├── LogCard.tsx        # 日志卡片（含悬停编辑/删除）
│   │   ├── LogActions.tsx     # 详情页编辑/删除按钮
│   │   ├── TokenGate.tsx      # Token 验证弹窗（sessionStorage 缓存）
│   │   └── MarkdownRenderer.tsx # Markdown 渲染
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   └── utils.ts           # generateApiKey 等工具函数
│   └── prisma/
│       └── schema.prisma      # 数据库 Schema
├── data/                      # SQLite 数据库文件（已 .gitignore）
├── deploy/
│   ├── ecosystem.config.cjs   # PM2 配置
│   ├── nginx.conf             # Nginx 反向代理配置
│   ├── deploy.sh              # 首次部署脚本
│   └── update.sh              # 更新部署脚本
├── client/
│   ├── install.sh             # Linux/Mac Shell 函数安装
│   └── install.ps1            # Windows PowerShell 函数安装
├── docs/                      # 设计文档（共十章）
├── rules/                     # AI 工具规则文件模板
├── CHANGELOG.md               # 版本更新记录
└── .github/
    └── copilot-instructions.md  # GitHub Copilot 规则模板（含占位符）
```

---

## 🌐 生产环境部署（Linux 服务器）

```bash
# 1. 克隆到服务器
git clone https://github.com/2634213728/Alog.git /home/alog/alog

# 2. 安装依赖 & 构建
cd /home/alog/alog/website
npm install
npm run build

# 3. 配置环境变量
echo 'DATABASE_URL="file:../../data/alog.db"' > .env
echo 'ADMIN_TOKEN="your-secure-token-here"' >> .env

# 4. 创建日志目录
mkdir -p /home/alog/alog/logs

# 5. 用 PM2 启动
pm2 start ../deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

详细部署指南（含 Nginx 配置、HTTPS 等）见 [docs/10-deployment.md](docs/10-deployment.md)

---

## 🔐 认证机制

| 场景 | 认证方式 | Header |
|------|---------|--------|
| 推送日志 | API Key | `Authorization: Bearer alog_xxxx` |
| Key 管理 | Admin Token | `x-admin-token: <token>` |
| 编辑/删除日志 | Admin Token 或 API Key | `x-token: <token>` |

- **Admin Token**：在 `.env` 中通过 `ADMIN_TOKEN` 配置，默认值 `change-this-admin-token`，**生产环境必须修改**
- **API Key**：格式 `alog_` + 40 位随机字符，通过 `/setup` 页面或 API 创建

---

## 📖 设计文档

| 章节 | 文件 | 内容 |
|------|------|------|
| 第一章 | [01-product-overview.md](docs/01-product-overview.md) | 产品定位与核心需求 |
| 第二章 | [02-system-architecture.md](docs/02-system-architecture.md) | 系统架构设计 |
| 第三章 | [03-content-types.md](docs/03-content-types.md) | 内容类型：日报与博客 |
| 第四章 | [04-trigger-mechanism.md](docs/04-trigger-mechanism.md) | 触发机制设计 |
| 第五章 | [05-api-design.md](docs/05-api-design.md) | API 接口设计 |
| 第六章 | [06-database-schema.md](docs/06-database-schema.md) | 数据库结构设计 |
| 第七章 | [07-frontend-design.md](docs/07-frontend-design.md) | 前端 UI 设计 |
| 第八章 | [08-client-shell.md](docs/08-client-shell.md) | 客户端 Shell 函数使用 |
| 第九章 | [09-ai-tool-rules.md](docs/09-ai-tool-rules.md) | AI 工具规则文件 |
| 第十章 | [10-deployment.md](docs/10-deployment.md) | Linux 服务器部署指南 |

---

## 📋 更新日志

见 [CHANGELOG.md](CHANGELOG.md)

---

## License

MIT
