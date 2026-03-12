# Changelog

所有版本的重要变更均记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.10.2] - 2026-03-12

### 修复
- `alog-mcp`：`delete_log` / `update_log` 调用返回 401 Unauthorized
- 根因：`PATCH /api/logs/[id]` 和 `DELETE /api/logs/[id]` 使用 `x-token` 请求头鉴权，而 `client.ts` 误用了 `Authorization: Bearer`（仅 `POST /api/logs` 使用此头）
- 修复方案：新增 `tokenHeaders()` 函数发送 `x-token`，`updateLog` 和 `deleteLog` 改用此函数；`pushLog` 保持 `authHeaders()`（`Authorization: Bearer`）
- npm 已发布：`alog-mcp@1.0.2`

---

## [1.10.1] - 2026-03-12

### 修复
- `alog-mcp`：`push_log` / `update_log` 写入含非 ASCII 字符（中文、日文等）时内容乱码
- 根因：Node.js `fetch` 将字符串 body 转为字节时在 Windows 下使用系统默认编码（非 UTF-8），导致多字节 UTF-8 序列损坏，存入数据库后显示为 `♦♦♦`
- 修复方案：`client.ts` 中新增 `utf8Body()` 辅助函数，显式用 `Buffer.from(JSON.stringify(data), 'utf-8')` 编码，强制 UTF-8 字节传输（与 PowerShell 脚本的 `[System.Text.Encoding]::UTF8.GetBytes()` 同理）
- npm 已发布：`alog-mcp@1.0.1`

---

## [1.10.0] - 2026-03-12

### 新增
- `alog-mcp/`：官方 MCP（Model Context Protocol）Server，基于 `@modelcontextprotocol/sdk` 实现
  - **7 个 Tools**：`push_log`、`search_logs`、`get_log`、`update_log`、`delete_log`、`get_tags`、`get_authors`
  - **4 个 Resources**：`alog://logs/recent`、`alog://logs/{id}`、`alog://tags`、`alog://authors`
  - **2 个 Prompts**：`write_daily_log`、`write_blog_post`
  - 支持 Claude Desktop、Cursor 等任意 MCP 客户端以 `npx -y alog-mcp` 方式接入
  - 环境变量配置：`ALOG_SERVER_URL`、`ALOG_API_KEY`、`ALOG_SOURCE`
- `docs/12-mcp-integration.md`：MCP 接入完整文档，含架构图、Tools/Resources/Prompts 说明、各客户端配置示例

### 修改
- `/setup` 接入页面新增 **Step 2: MCP 接入（推荐）** 模块
  - 支持 Claude Desktop 和 Cursor 两种 MCP 客户端配置自动生成
  - 凭证填写后自动内嵌到配置文件 JSON 展示
  - 显示全部 7 个可用 Tool 标签
  - 原规则文件方案移至 **Step 3（可选）**
- 接入页面标题描述更新，突出 MCP 作为主流接入方案

---

## [1.9.3] - 2026-03-12

### 修复
- `.github/copilot-instructions.md`：PowerShell 模板双引号字符串中反引号（`` ` ``）被 PowerShell 转义，导致 Markdown 代码块围栏（` ```bash `、` ```typescript ` 等）写入数据库时损坏，显示格式混乱
- 修复方案：将 `$c = "..."` 改为单引号 Here-String `$c = @'...'@`，其中反引号不做任何转义，Markdown 代码块内容原样保留
- 规则版本从 `v2.0` 升至 `v2.1`

---

## [1.9.2] - 2026-03-12

### 新增
- `CONTRIBUTING.md`：贡献指南，包含提交规范（Conventional Commits）、CHANGELOG 维护规范、版本号规则、分支策略和代码规范
- `.github/PULL_REQUEST_TEMPLATE.md`：PR 模板，提交 PR 时自动展示变更类型勾选项和提交前检查清单（含 CHANGELOG 更新提醒）
- `.github/ISSUE_TEMPLATE/bug_report.md`：Bug 报告 Issue 模板
- `.github/ISSUE_TEMPLATE/feature_request.md`：功能请求 Issue 模板
- `.github/workflows/pr-checks.yml`：PR 自动化检查 CI，包含 CHANGELOG 更新检测、ESLint 和构建验证三个 job
- `client/hooks/pre-commit`：Git pre-commit Hook 脚本，本地提交前自动检查 CHANGELOG 是否已更新
- `client/hooks/install-hooks.sh`：一键安装 Git Hooks 脚本
- `.vscode/extensions.json`：VS Code 推荐扩展，包含 ESLint、Tailwind、Prisma、Conventional Commits、GitLens 等
- `README.md`：新增「参与贡献」章节，链接到 CONTRIBUTING.md

---

## [1.9.2] - 2026-03-12

### 修复
- 小屏侧边栏不可展开问题：改为固定抽屉式，点击 Header 汉堡按钮从左侧滑入，点击遮罩或 ✕ 关闭
- 新增 `SidebarDrawer` 客户端组件处理移动端开关逻辑，`Sidebar` 保持服务端组件
- 汉堡按钮仅在 ≤1024px 显示，侧边栏 `display:none` 改为 `position:fixed; left:-290px` 过渡方案

---

## [1.9.1] - 2026-03-12

### 性能优化
- `next.config.ts`：启用 `compress: true`、静态资源 `Cache-Control: immutable`、`optimizePackageImports` 按需摇树
- 所有列表/首页由 `force-dynamic` 改为 `revalidate = 30`，开启页面级 ISR 缓存
- `Sidebar`：5 条 Prisma 查询改用 `unstable_cache`（30s TTL），每请求重复开销归零
- `BackgroundFX`：粒子数量 25 → 12，使用 `DocumentFragment` 批量挂载减少重排，`.alog-particles` 添加 `contain: strict`
- `StatCounterGrid`：4 个独立 `IntersectionObserver` 合并为父级单实例，子卡片共享触发信号
- `globals.css`：`.alog-particle` 与 `.logo-shimmer` 添加 `will-change: transform / background-position`，提升合成层性能
- 新增 `@media (prefers-reduced-motion: reduce)` 全局规则，无障碍访问时禁用所有关键帧动画
- Google Fonts 从 CSS `@import`（渲染阻塞）迁移至 `next/font/google`（本地托管 + `display: swap`），消除 FOIT

---

## [1.9.0] - 2026-03-12

### 新增
- 赛博科技视觉风格全面重构：网格背景粒子动画（`BackgroundFX`）、霓虹扫描徽章、Logo 光晕流动、区块标题 Cyber 风格
- 三栏布局：左侧固定 Sidebar + 顶部 Header + 主内容区（`alog-layout`）
- `Sidebar` 组件：Categories 日志分类计数、Hot Tags 热门标签、Quick Nav 快速导航、System Status 内存监控面板（`process.memoryUsage()` + 今日推送数）
- `StatCounterGrid` 组件：IntersectionObserver 滚动触发数字计数动画，支持 3 / 4 列
- `TableOfContents` 组件：解析 Markdown 标题自动生成目录，IntersectionObserver 高亮当前节，点击平滑滚动，多级缩进
- 赛博搜索弹窗：点击顶栏搜索按钮弹出全屏毛玻璃遮罩 + 居中面板，支持 Ctrl+K 唤起、Esc 关闭
- 日志详情双栏布局：文章区（header + 正文）+ 右侧粘性目录栏，≤1100px 自动隐藏目录
- `MarkdownRenderer` 支持标题自动注入 `id`（`slugifyHeading`），供 TOC 锚点跳转

### 修改
- Header 精简：移除导航链接，仅保留 Logo + 搜索触发按钮 + 主题切换
- 日报、博客、全部日志列表页统一改为 `logs-grid-2` 两列卡片网格
- 首页去除"实时日志推送"Terminal 演示 section
- `setup` 页面：所有硬编码深色 Tailwind 类替换为 CSS 变量（兼容浅色模式）
- `changelog` 页面移除内层 `<main>` 包裹，对齐侧边栏布局

### 修复
- `[type]/[id]/page.tsx` 注释多余 `}` 导致的 ECMAScript 解析错误
- `TagBadge` 缺少 `'use client'` 指令导致事件处理报错

---

## [1.8.1] - 2026-03-11

### 修改
- 优化前端展示，统一子页面标题与标签在浅色模式下的展示效果，增加科技风格。
- 用内联 Tailwind CSS (hover) 替代硬编码在 `<Link>` 上的 `onMouseEnter/onMouseLeave` 以符合 Next.js App Router 服务端组件渲染规范。

### 修复
- 修复 `app/authors/page.tsx`, `app/authors/[name]/page.tsx`, `app/[type]/[id]/page.tsx`, `app/edit/[id]/EditForm.tsx` 的事件处理渲染导致 Performance 'measure' on 'Performance': 'LinkComponent' cannot have a negative time stamp 的前端异常问题。

---

## [1.8.0] - 2026-03-11

### 新增
- 双主题系统：深空极客（Dark）与实验室极简（Light），支持 `localStorage` 持久化 + 系统偏好检测
- `ThemeProvider` 组件：React context 管理主题状态，FOUC 防闪烁内联脚本注入 `<head>`
- `ThemeToggle` 按钮：Header 右上角太阳/月亮 SVG 图标，一键切换
- 首页改版为数据概览仪表盘：6 项统计卡（总日志 / 日报 / 博客 / 标签 / 作者 / 阅读量）+ 特性介绍 + 最新动态 + 热门标签 + 快速接入入口
- `/logs` 页面：原首页日志列表迁移至此

### 修改
- `globals.css` 全面重构为 CSS 自定义属性系统，支持暗色（`:root`）与亮色（`[data-theme="light"]`）双令牌集
- Header 导航重组：新增"概览"（/）与"日志"（/logs），统一使用 CSS 变量配色
- `TagBadge` 组件颜色改用 CSS 变量，适配双主题
- 所有卡片、输入框、Markdown 块均更新为 `var(--bg)` / `var(--accent)` 等 CSS 变量

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
