# Contributing Guide

感谢你参与 Alog 的开发！在提交代码之前，请阅读以下规范。

---

## 目录

- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [CHANGELOG 维护规范](#changelog-维护规范)
- [版本号规则](#版本号规则)
- [分支策略](#分支策略)
- [代码规范](#代码规范)

---

## 开发流程

```
fork → 新建功能分支 → 开发 → 更新 CHANGELOG → 提交 PR
```

1. 从 `main` 切出功能分支：`git checkout -b feat/your-feature`
2. 完成开发后，**必须更新 `CHANGELOG.md`**（见下方规范）
3. 提交 PR，填写 PR 模板中的检查项

---

## 提交规范

Commit message 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>
```

| type     | 含义           |
|----------|---------------|
| `feat`   | 新功能         |
| `fix`    | Bug 修复       |
| `perf`   | 性能优化       |
| `refactor` | 重构（无功能变化）|
| `docs`   | 文档变更       |
| `chore`  | 构建/依赖/工具 |

示例：
```
feat(api): 新增日志批量删除接口
fix(sidebar): 修复标签数量计数重复问题
perf(cache): Sidebar 查询改用 unstable_cache
```

---

## CHANGELOG 维护规范

> ⚠️ **强制要求**：每次功能变更、Bug 修复、性能优化，提交 PR 前必须同步更新 `CHANGELOG.md`。

### 格式

在文件顶部 `---` 分隔线后插入新版本块：

```markdown
## [x.y.z] - YYYY-MM-DD

### 新增
- 功能描述

### 修改
- 变更描述

### 修复
- 问题描述

### 性能优化
- 优化描述
```

### 规则

- 仅记录**对用户/开发者有影响**的变更，不记录纯代码内部重命名等
- 每条描述以动词开头，说明**做了什么 + 影响范围**
- 遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 标准

---

## 版本号规则

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

| 变更类型         | 版本号         | 示例              |
|----------------|--------------|-----------------|
| 新功能           | minor +1     | 1.3.0 → **1.4.0** |
| Bug 修复 / 小调整 | patch +1     | 1.4.0 → **1.4.1** |
| 破坏性变更       | major +1     | 1.x.x → **2.0.0** |

---

## 分支策略

| 分支          | 用途                          |
|--------------|------------------------------|
| `main`       | 生产环境，只接受 PR 合并        |
| `feat/*`     | 新功能开发                    |
| `fix/*`      | Bug 修复                      |
| `perf/*`     | 性能优化                      |
| `chore/*`    | 构建、依赖、文档等维护性工作     |

---

## 代码规范

- 使用 TypeScript strict 模式，禁止 `any`（eslint 会检查）
- 组件文件名使用 PascalCase：`LogCard.tsx`
- API 路由统一放在 `app/api/` 目录
- 数据库操作统一通过 `lib/prisma.ts` 的 Prisma Client

### 本地启动

```bash
cd website
npm install
npm run dev
```

### 检查

```bash
npm run lint      # ESLint 检查
npm run build     # 构建验证
```
