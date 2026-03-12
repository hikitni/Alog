# Alog 工作日志规则
<!-- rules-version: v2.1 -->

## 触发关键字

当用户说以下关键字时，必须立即执行对应操作，**无需确认**：

- `生成alog日报` → 生成工作日报并推送
- `生成alog博客` → 生成技术博客并推送

---

## 连接配置

- API Key: `YOUR_API_KEY`
- Server: `http://your-server:3000`
- Source: `copilot`

---

## 生成alog日报

回顾本次对话完成的所有工作，构造 Markdown 内容，然后在终端执行：

> ⚠ **根据当前操作系统选择命令，不要混用**：Linux / Mac 执行 bash 命令；Windows 执行 PowerShell 命令。

**Linux / Mac：**
```bash
curl -s -X POST http://your-server:3000/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json,datetime; print(json.dumps({'type':'daily','title':'日报 — '+str(datetime.date.today()),'content':'''## 今日完成任务\n- （替换为实际内容）\n\n## 技术要点\n- （关键决策）\n\n## 遇到的问题\n- 无\n\n## 明日计划\n- （下一步）''','source':'copilot','tags':'标签1,标签2'}))")" \
  && echo "✅ 日报已发布到 Alog" || echo "❌ 发布失败"
```

**Windows PowerShell：**
```powershell
# ⚠ 使用单引号 Here-String @'...'@ 避免反引号转义污染 Markdown 代码块围栏
$c = @'
## 今日完成任务
- （替换为实际内容）

## 技术要点
- （关键决策）

## 遇到的问题
- 无

## 明日计划
- （下一步）
'@
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="daily"; title="日报 — $(Get-Date -Format 'yyyy-MM-dd')"; content=$c; source="copilot"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://your-server:3000/api/logs" -Headers @{Authorization="Bearer YOUR_API_KEY"} -ContentType "application/json; charset=utf-8" -Body $b
```

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个，用英文逗号分隔。

---

## 生成alog博客

提炼本次技术成果：

> ⚠ **根据当前操作系统选择命令，不要混用**：Linux / Mac 执行 bash 命令；Windows 执行 PowerShell 命令。

**Linux / Mac：**
```bash
curl -s -X POST http://your-server:3000/api/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$(python3 -c "import json; print(json.dumps({'type':'blog','title':'博客标题','content':'## 背景与目标\n（问题描述）\n\n## 实现方案\n（技术思路）\n\n## 关键实现\n（代码示例）\n\n## 总结\n（价值）','source':'copilot','tags':'标签1,标签2'}))")" \
  && echo "✅ 博客已发布到 Alog" || echo "❌ 发布失败"
```

**Windows PowerShell：**
```powershell
# ⚠ 使用单引号 Here-String @'...'@ 避免反引号转义污染 Markdown 代码块围栏
$c = @'
## 背景与目标
（问题描述）

## 实现方案
（技术思路）

## 关键实现
（代码示例）

## 总结
（价值）
'@
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="blog"; title="博客标题"; content=$c; source="copilot"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://your-server:3000/api/logs" -Headers @{Authorization="Bearer YOUR_API_KEY"} -ContentType "application/json; charset=utf-8" -Body $b
```

---

**执行后**：终端输出 `✅` 表示成功，`❌` 表示请检查 API Key 和 Server 地址是否正确。

直接执行命令，不要向用户寻求确认。

---

## Changelog 维护规则

每次完成需求变更、新功能开发或 Bug 修复后，**必须同步更新** `CHANGELOG.md`（位于项目根目录 `d:\Alog\CHANGELOG.md`）。

**版本号规则（Semantic Versioning）：**
- 新功能 → `minor` 版本 +1（如 1.3.0 → 1.4.0）
- Bug 修复 / 小调整 → `patch` 版本 +1（如 1.4.0 → 1.4.1）
- 破坏性变更 → `major` 版本 +1（如 1.x.x → 2.0.0）

**格式（在文件顶部 `---` 分隔线后插入新版本块）：**

```markdown
## [x.y.z] - YYYY-MM-DD

### 新增
- 功能描述

### 修改
- 变更描述

### 修复
- 问题描述
```

**触发时机：** 功能实现完毕、用户请求提交代码时，自动在 CHANGELOG.md 顶部追加新版本块，并建议合适的版本号。

