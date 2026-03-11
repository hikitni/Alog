# Changelog

所有版本的重要变更均记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

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
