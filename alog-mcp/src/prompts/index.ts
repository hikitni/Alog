import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function registerPrompts(server: McpServer) {
  // Daily log prompt
  server.prompt(
    'write_daily_log',
    '根据当前对话上下文生成结构化工作日报，并自动调用 push_log 写入 Alog',
    [
      { name: 'date', description: '日期，格式 YYYY-MM-DD，默认今天', required: false },
      { name: 'tags', description: '标签，逗号分隔，如 "TypeScript,React"', required: false },
    ],
    ({ date, tags }) => {
      const d = date ?? new Date().toISOString().slice(0, 10)
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请根据我们今天（${d}）的对话内容，生成一篇结构化工作日报。

日报格式（Markdown）：
## 今日完成任务
- 任务1
- 任务2

## 技术要点
- 关键决策或技术细节

## 遇到的问题
- 问题描述（无则写"无"）

## 明日计划
- 下一步计划

生成完毕后，立即调用 push_log 工具写入 Alog：
- type: "daily"
- title: "日报 — ${d}"
- tags: "${tags ?? '（从内容提取）'}"

不要等用户确认，直接执行。`,
            },
          },
        ],
      }
    }
  )

  // Blog post prompt
  server.prompt(
    'write_blog_post',
    '将本次对话的技术实现提炼为技术博客，自动调用 push_log 写入 Alog',
    [
      { name: 'title', description: '博客标题', required: false },
      { name: 'tags', description: '标签，逗号分隔', required: false },
    ],
    ({ title, tags }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `请将本次对话涉及的技术实现提炼为一篇技术博客。

博客格式（Markdown）：
## 背景与目标
（问题描述，为什么要做这件事）

## 实现方案
（技术思路，架构设计）

## 关键实现
（核心代码片段和说明）

## 总结
（价值、收获、后续方向）

博客标题：${title ?? '（请根据内容生成合适标题）'}
标签：${tags ?? '（从内容提取，2-5 个）'}

生成完毕后立即调用 push_log 写入 Alog：
- type: "blog"
不要等用户确认，直接执行。`,
          },
        },
      ],
    })
  )
}
