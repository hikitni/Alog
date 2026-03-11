# 第五章：API 接口设计

## 5.1 接口总览

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/api/logs` | API Key | 推送新日志 |
| `GET` | `/api/logs` | 无 | 查询日志列表（支持全文检索 + 分页） |
| `GET` | `/api/tags` | 无 | 获取标签列表（含数量） |
| `GET` | `/api/authors` | 无 | 获取作者列表（含日志数） |
| `POST` | `/api/logs/[id]/view` | 无 | 记录该条日志的一次访问 |
| `PATCH` | `/api/logs/[id]` | Token | 编辑日志 |
| `DELETE` | `/api/logs/[id]` | Token | 删除日志 |
| `POST` | `/api/auth/verify` | 无 | 验证 Token 合法性 |
| `POST` | `/api/keys` | Admin Token | 创建 API Key |
| `GET` | `/api/keys` | Admin Token | 列出所有 API Key（需鉴权） |
| `DELETE` | `/api/keys` | Admin Token | 删除 API Key（支持 `?id=` 参数） |

---

## 5.2 推送日志 `POST /api/logs`

### 请求头
```http
Authorization: Bearer <api-key>
Content-Type: application/json; charset=utf-8
```

> **重要**：推送包含中文内容时，`Content-Type` 必须携带 `charset=utf-8`，否则内容存入数据库时会出现乱码。PowerShell 客户端需额外将 body 转为 UTF-8 字节数组（详见第八章）。

### 请求体

```jsonc
{
  "type": "daily",           // 必填：'daily' | 'blog'
  "content": "## 今日...",   // 必填：Markdown 正文
  "title": "日报 2026-03-10",// 可选：标题（不填自动生成）
  "source": "cursor",        // 可选：来源工具（默认取 API Key 的 source）
  "workspace": "D:/MyProject",// 可选：工作区路径
  "tags": "TypeScript,Auth,JWT" // 可选：逗号分隔字符串 或 字符串数组
}
```

### 响应

**成功（201 Created）：**
```json
{
  "success": true,
  "log": {
    "id": "uuid",
    "type": "daily",
    "title": "日报 — 2026-03-10",
    "content": "...",
    "source": "cursor",
    "workspace": "D:/MyProject",
    "createdAt": "2026-03-10T09:00:00.000Z",
    "tags": [
      { "tag": { "id": "uuid", "name": "TypeScript", "slug": "typescript" } }
    ]
  }
}
```

**失败（401 Unauthorized）：**
```json
{ "error": "Missing API key" }
```

**失败（400 Bad Request）：**
```json
{ "error": "type must be daily or blog" }
```

---

## 5.3 查询日志 `GET /api/logs`

### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | `string` | — | 关键字全文检索（title + content + tag.name，`LIKE` 匹配） |
| `type` | `daily` \| `blog` | — | 按日志类型筛选 |
| `author` | `string` | — | 按作者精确筛选 |
| `tag` | `string` | — | 按标签 slug 精确筛选 |
| `from` | `YYYY-MM-DD` | — | 创建时间下界（闭区间） |
| `to` | `YYYY-MM-DD` | — | 创建时间上界（含当天 23:59:59） |
| `page` | `number` | `1` | 页码（从 1 起） |
| `pageSize` | `number` | `20` | 每页数量（最大 100） |
| `limit` | `number` | — | 兼容旧调用，传入时直接 take N 条并省略分页字段 |

### 响应

**分页响应（不传 `limit` 时）：**
```json
{
  "logs": [...],
  "total": 87,
  "page": 2,
  "pageSize": 20,
  "totalPages": 5
}
```

**兼容旧响应（传 `limit` 时）：**
```json
{ "logs": [...] }
```

### 示例
```bash
# 关键字检索
GET /api/logs?q=React

# 组合：博客 + 关键字 + 时间范围 + 第 2 页
GET /api/logs?q=TypeScript&type=blog&from=2026-01-01&to=2026-03-11&page=2

# 按作者检索
GET /api/logs?author=张三

# 兼容旧用法
GET /api/logs?type=daily&limit=10
GET /api/logs?tag=typescript
```

---

## 5.4 标签列表 `GET /api/tags`

### 响应
```json
{
  "tags": [
    { "id": "uuid", "name": "TypeScript", "slug": "typescript", "count": 12 },
    { "id": "uuid", "name": "React", "slug": "react", "count": 8 }
  ]
}
```

标签按日志数量降序排列。

---

## 5.5 作者列表 `GET /api/authors`

返回所有有日志记录的作者，不暴露关联的 API Key。

### 响应
```json
{
  "authors": [
    {
      "name": "张三",
      "slug": "zhang-san",
      "source": "copilot",
      "logCount": 18,
      "dailyCount": 12,
      "blogCount": 6
    },
    {
      "name": "李四",
      "slug": "li-si",
      "source": "cursor",
      "logCount": 7,
      "dailyCount": 5,
      "blogCount": 2
    }
  ]
}
```

---

## 5.6 记录访问 `POST /api/logs/[id]/view`

详情页首次渲染时自动调用，增加该日志的访问计数。

- 无鉴权要求（公开接口）
- 防刻捺策略：服务端可依据 IP + 1h TTL 去重（简单实现可先跳过）

### 请求
```http
POST /api/logs/3b0184ae-d892-42f1-a004-977d5bc9d995/view
```

无请求体。

### 响应
```json
{ "viewCount": 42 }
```

---

## 5.7 API Key 管理

**请求头：**
```http
x-admin-token: <admin-token>
Content-Type: application/json
```

**请求体：**
```json
{
  "name": "Cursor-工作机",
  "source": "cursor",
  "author": "张三"
}
```

> `author` 字段为可选项，代表该 Key 所属的作者显示名称。推送日志时会自动将此值复制到日志的 `author` 字段（不可追溯历史记录）。

**响应：**
```json
{
  "success": true,
  "apiKey": {
    "id": "uuid",
    "name": "Cursor-工作机",
    "key": "YOUR_CURSOR_API_KEY",
    "source": "cursor",
    "author": "张三",
    "createdAt": "2026-03-10T09:00:00.000Z"
  }
}
```

---

### 列出所有 Key `GET /api/keys`

**请求头：**
```http
x-admin-token: <admin-token>
```

**响应：**
```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "name": "GitHub-Copilot",
      "key": "alog_xxxxxxxxxxxxxxxxxxxx",
      "source": "copilot",
      "createdAt": "2026-03-10T09:00:00.000Z"
    }
  ]
}
```

### 删除 Key `DELETE /api/keys`

支持两种方式传入要删除的 Key ID：

**方式一（Query 参数，推荐）：**
```http
DELETE /api/keys?id=<key-id>
x-admin-token: <admin-token>
```

**方式二（JSON Body）：**
```http
DELETE /api/keys
x-admin-token: <admin-token>
Content-Type: application/json

{ "id": "<key-id>" }
```

---

## 5.8 认证机制

### API Key 认证（日志推送）
- 每个 AI 工具配置独立的 API Key
- Key 格式：`alog_` 前缀 + 40 位随机字符
- 通过 `Authorization: Bearer <key>` 头传递
- 服务器验证 Key 存在性 → 获取关联的 `source` 来源标识

### Admin Token（Key 管理）
- 通过环境变量 `ADMIN_TOKEN` 配置
- 通过 `x-admin-token` 头传递
- 仅用于 Key 的创建、列举、删除
- **生产环境必须修改默认值**

---

## 5.9 Shell 函数调用示例

### Bash/Zsh（Linux/Mac）
```bash
cat << 'ALOG_EOF' | 生成alog日报 "TypeScript,Auth,性能优化"
## 今日完成任务
- 实现 JWT 登录模块
- 修复移动端样式问题

## 技术要点
- 双 Token 策略，accessToken 15 分钟
ALOG_EOF
```

### PowerShell（Windows）
```powershell
@"
## 今日完成任务
- 实现 JWT 登录模块
"@ | 生成alog日报 "TypeScript,Auth"
```

### 直接 curl 调用（测试用）
```bash
curl -X POST https://your-server/api/logs \
  -H "Authorization: Bearer alog_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog",
    "title": "JWT 认证完整实现",
    "content": "## 背景\n...",
    "tags": "TypeScript,Auth,JWT"
  }'
```
