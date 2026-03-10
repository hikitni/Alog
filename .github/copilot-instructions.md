# Alog 工作日志规则
<!-- rules-version: v2.0 -->

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

回顾本次对话完成的所有工作，构造 Markdown 内容，然后在终端执行（**根据操作系统选择对应命令**）：

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
$c = "## 今日完成任务`n- （替换为实际内容）`n`n## 技术要点`n- （关键决策）`n`n## 遇到的问题`n- 无`n`n## 明日计划`n- （下一步）"
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="daily"; title="日报 — $(Get-Date -Format 'yyyy-MM-dd')"; content=$c; source="copilot"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://your-server:3000/api/logs" -Headers @{Authorization="Bearer YOUR_API_KEY"} -ContentType "application/json; charset=utf-8" -Body $b
```

标签规则：从对话提取技术栈名 + 功能模块名，2-5 个，用英文逗号分隔。

---

## 生成alog博客

提炼本次技术成果：

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
$c = "## 背景与目标`n（问题描述）`n`n## 实现方案`n（技术思路）`n`n## 关键实现`n（代码示例）`n`n## 总结`n（价值）"
$b = [System.Text.Encoding]::UTF8.GetBytes((@{ type="blog"; title="博客标题"; content=$c; source="copilot"; tags="标签1,标签2" } | ConvertTo-Json -Depth 3))
Invoke-RestMethod -Method Post -Uri "http://your-server:3000/api/logs" -Headers @{Authorization="Bearer YOUR_API_KEY"} -ContentType "application/json; charset=utf-8" -Body $b
```

---

**执行后**：终端输出 `✅` 表示成功，`❌` 表示请检查 API Key 和 Server 地址是否正确。

直接执行命令，不要向用户寻求确认。
