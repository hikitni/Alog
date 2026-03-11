# Changelog

所有版本的重要变更均记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.7.0] - 2026-03-11

### 新增
- 全文检索功能：`GET /api/logs` 新增 `q`（关键字）、`author`、`from`、`to`、`page`、`pageSize` 参数，支持 title + content + tag.name 的 `LIKE` 模糊匹配，同时返回分页元数据（`total`、`totalPages`）；保留 `limit` 参数向后兼容
- `/search` 页面：独立检索页，含实时搜索（300ms debounce）、过滤面板（类型/作者/日期范围）、分页按钮组、骨架屏 loading 状态、空态提示
- Header 搜索入口：右上角新增 🔍 图标，点击后展开内联搜索框，Enter 跳转 `/search?q=...`，Escape 关闭

---

## [1.6.0] - 2026-03-11

### 新增
- 点击导航栏 ALOG Logo 跳转到 GitHub 仓库（`https://github.com/2634213728/Alog`，新标签页打开）
- 创建项目根目录 `README.md`，包含功能特性、技术栈、项目结构、快速开始、部署指南、认证机制等完整说明
- 替换 `website/README.md` 中的 Next.js 样板内容，改为项目自身开发指南

### 修改
- /setup 页面生成的规则文件（方案D）：日报和博客命令块均添加明确警示，提示 AI 不要跨操作系统混用 bash 与 PowerShell 命令
- `.github/copilot-instructions.md` 模板同步更新相同警示

---

## [1.5.1] - 2026-03-11

### 修复
- `CopyButton` 在 HTTP 明文环境（如 `http://101.33.55.60:3001`）下无法复制 API Key —— `navigator.clipboard` 仅在安全上下文（HTTPS/localhost）可用，新增 `document.execCommand('copy')` 降级方案，并加入 try-catch 防止静默报错

---

## [1.5.0] - 2026-03-11

### 新增
- 日志编辑功能：独立编辑页 `/edit/[id]`，左侧表单 + 右侧 Markdown 实时预览
- 日志删除功能：详情页底部及列表卡片 hover 时均可删除，二次确认弹窗防误操作
- `PATCH /api/logs/[id]`：编辑日志接口，支持修改标题、内容、类型、标签
- `DELETE /api/logs/[id]`：删除日志接口，同步清理标签关联
- `POST /api/auth/verify`：Token 验证接口，兼容 ADMIN_TOKEN 和任意 API Key
- `TokenGate` 组件：统一的 Token 输入弹窗，验证通过后缓存至 `sessionStorage`，本次会话内免重复输入
- `LogActions` 组件：详情页底部的编辑/删除操作区

### 修改
- `LogCard`：hover 时右上角显示编辑（✏️）和删除（🗑）快捷按钮
- 详情页 footer：新增编辑/删除操作按钮组

---

## [1.4.0] - 2026-03-11

### 新增
- Changelog 页面（`/changelog`）：版本历史记录，支持 Markdown 渲染
- Header 导航新增「更新日志」入口
- Copilot 规则文件新增 Changelog 维护规则，需求变更时自动提示更新

---

## [1.3.0] - 2026-03-10

### 新增
- `/setup` 接入页面全面重构为两步式零安装流程
- 规则文件内嵌凭证（API Key + Server URL），AI 工具直接执行 curl，无需安装 Shell 函数
- 工具选择器 Tab：支持 GitHub Copilot / Cursor / Claude Code / Windsurf / 通用五种工具
- Key Manager 新增 `author` 字段，支持多人团队区分日志来源
- 实时规则预览，「✓ 已内嵌凭证」指示器，一键复制完整规则内容

### 修改
- 接入流程从三步缩减为两步，移除 Shell 函数安装步骤
- `copilot-instructions.md` 改为模板格式（占位符），不再硬编码凭证

---

## [1.2.0] - 2026-03-10

### 新增
- 作者系统：日志支持 `author` 字段，记录每条日志的创建者
- `/authors` 作者列表页：展示所有作者及其日报/博客数量统计
- `/authors/[name]` 作者详情页：按类型筛选查看某作者的所有日志
- 访问量统计：`viewCount` 字段，日志详情页首次加载自动 +1
- `ViewCounter` 客户端组件，调用 `POST /api/logs/[id]/view`
- Header 导航新增「作者」入口

### 修改
- 日志卡片（`LogCard`）展示作者名，可点击跳转到作者详情页

---

## [1.1.0] - 2026-03-10

### 新增
- 标签系统：`/tags` 标签云页面，展示所有标签及使用频次
- `/tags/[slug]` 标签详情页：按标签筛选日志列表
- `GET /api/tags` 接口：返回标签统计数据
- API Key 管理：`/setup` 页面支持创建、查看、复制、删除 API Key
- `GET/POST/DELETE /api/keys` 接口（需 Admin Token 鉴权）

---

## [1.0.0] - 2026-03-10

### 初始发布
- Next.js 15（App Router）+ SQLite + Prisma 7 + Tailwind CSS v4 技术栈
- 日志双类型：`daily`（日报）、`blog`（博客）
- REST API：`POST /api/logs` 推送日志，`GET /api/logs` 查询列表
- 首页日志列表，支持按类型筛选（全部 / 日报 / 博客）
- 日志详情页，Markdown 渲染，代码语法高亮（atom-one-dark 主题）
- AI 工具规则文件模板：触发关键字 `生成alog日报` / `生成alog博客`
- 客户端 Shell 函数安装脚本（Linux / Windows PowerShell）
- 部署配置：PM2 + Nginx
