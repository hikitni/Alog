#!/usr/bin/env node
"use strict";

// src/index.ts
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");

// src/server.ts
var import_mcp2 = require("@modelcontextprotocol/sdk/server/mcp.js");

// src/tools/push-log.ts
var import_zod = require("zod");

// src/config.ts
var config = {
  serverUrl: (process.env.ALOG_SERVER_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  apiKey: process.env.ALOG_API_KEY ?? "",
  source: process.env.ALOG_SOURCE ?? "mcp"
};
if (!config.apiKey) {
  process.stderr.write(
    "[alog-mcp] Warning: ALOG_API_KEY is not set. Write operations (push_log, update_log, delete_log) will fail.\n"
  );
}

// src/client.ts
function authHeaders() {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json; charset=utf-8"
  };
}
async function request(path, opts) {
  const url = `${config.serverUrl}${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ALOG API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}
async function listLogs(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== void 0 && v !== "") qs.set(k, String(v));
  }
  return request(`/api/logs?${qs}`);
}
async function getLog(id) {
  return request(`/api/logs/${id}`);
}
async function getTags() {
  return request("/api/tags");
}
async function getAuthors() {
  return request("/api/authors");
}
async function pushLog(body) {
  return request("/api/logs", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ...body, source: body.source ?? config.source })
  });
}
async function updateLog(id, body) {
  return request(`/api/logs/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
}
async function deleteLog(id) {
  return request(`/api/logs/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
}

// src/tools/push-log.ts
function registerPushLog(server) {
  server.tool(
    "push_log",
    "\u5C06\u65E5\u62A5\uFF08daily\uFF09\u6216\u535A\u5BA2\uFF08blog\uFF09\u5199\u5165 Alog \u5DE5\u4F5C\u65E5\u5FD7\u7CFB\u7EDF\u3002content \u4F7F\u7528 Markdown \u683C\u5F0F\u3002",
    {
      type: import_zod.z.enum(["daily", "blog"]).describe("\u65E5\u5FD7\u7C7B\u578B\uFF1Adaily=\u65E5\u62A5\uFF0Cblog=\u6280\u672F\u535A\u5BA2"),
      content: import_zod.z.string().min(1).describe("Markdown \u6B63\u6587\u5185\u5BB9"),
      title: import_zod.z.string().optional().describe("\u6807\u9898\uFF0C\u4E0D\u586B\u65F6\u7CFB\u7EDF\u81EA\u52A8\u751F\u6210"),
      tags: import_zod.z.string().optional().describe('\u9017\u53F7\u5206\u9694\u7684\u6807\u7B7E\uFF0C\u5982 "TypeScript,React,MCP"'),
      workspace: import_zod.z.string().optional().describe('\u5F53\u524D\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF0C\u5982 "D:/my-project"')
    },
    async ({ type, content, title, tags, workspace }) => {
      try {
        const data = await pushLog({ type, content, title, tags, workspace });
        return {
          content: [
            {
              type: "text",
              text: `\u2705 \u65E5\u5FD7\u5199\u5165\u6210\u529F
\u6807\u9898\uFF1A${data.log.title}
ID\uFF1A${data.log.id}
\u7C7B\u578B\uFF1A${data.log.type}`
            }
          ]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u5199\u5165\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/search-logs.ts
var import_zod2 = require("zod");
function registerSearchLogs(server) {
  server.tool(
    "search_logs",
    "\u5168\u6587\u68C0\u7D22\u548C\u7B5B\u9009 Alog \u65E5\u5FD7\uFF0C\u652F\u6301\u5173\u952E\u5B57\u3001\u7C7B\u578B\u3001\u4F5C\u8005\u3001\u6807\u7B7E\u3001\u65F6\u95F4\u8303\u56F4\u7B49\u591A\u7EF4\u5EA6\u67E5\u8BE2\u3002",
    {
      q: import_zod2.z.string().optional().describe("\u5173\u952E\u5B57\u641C\u7D22\uFF0C\u5339\u914D\u6807\u9898\u3001\u6B63\u6587\u548C\u6807\u7B7E"),
      type: import_zod2.z.enum(["daily", "blog"]).optional().describe("\u65E5\u5FD7\u7C7B\u578B\u7B5B\u9009"),
      author: import_zod2.z.string().optional().describe("\u6309\u4F5C\u8005\u540D\u79F0\u7CBE\u786E\u7B5B\u9009"),
      tag: import_zod2.z.string().optional().describe('\u6309\u6807\u7B7E slug \u7CBE\u786E\u7B5B\u9009\uFF0C\u5982 "typescript"'),
      from: import_zod2.z.string().optional().describe("\u5F00\u59CB\u65E5\u671F YYYY-MM-DD"),
      to: import_zod2.z.string().optional().describe("\u7ED3\u675F\u65E5\u671F YYYY-MM-DD"),
      page: import_zod2.z.number().int().min(1).optional().default(1).describe("\u9875\u7801\uFF0C\u4ECE 1 \u8D77"),
      pageSize: import_zod2.z.number().int().min(1).max(50).optional().default(10).describe("\u6BCF\u9875\u6570\u91CF\uFF0C\u6700\u5927 50")
    },
    async ({ q, type, author, tag, from, to, page, pageSize }) => {
      try {
        const params = { page: page ?? 1, pageSize: pageSize ?? 10 };
        if (q) params.q = q;
        if (type) params.type = type;
        if (author) params.author = author;
        if (tag) params.tag = tag;
        if (from) params.from = from;
        if (to) params.to = to;
        const data = await listLogs(params);
        if (data.logs.length === 0) {
          return { content: [{ type: "text", text: "\u672A\u627E\u5230\u5339\u914D\u7684\u65E5\u5FD7" }] };
        }
        const lines = [
          `\u5171 ${data.total} \u6761\u8BB0\u5F55\uFF08\u7B2C ${data.page}/${data.totalPages} \u9875\uFF09`,
          "",
          ...data.logs.map((log, i) => {
            const tags = log.tags.map((t) => t.tag.name).join(", ");
            return [
              `${i + 1}. [${log.type.toUpperCase()}] ${log.title}`,
              `   ID: ${log.id}`,
              `   \u4F5C\u8005: ${log.author || "\u672A\u77E5"} | \u65F6\u95F4: ${log.createdAt.slice(0, 10)}`,
              tags ? `   \u6807\u7B7E: ${tags}` : ""
            ].filter(Boolean).join("\n");
          })
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u67E5\u8BE2\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-log.ts
var import_zod3 = require("zod");
function registerGetLog(server) {
  server.tool(
    "get_log",
    "\u6839\u636E ID \u83B7\u53D6\u5355\u6761\u65E5\u5FD7\u7684\u5B8C\u6574\u5185\u5BB9\uFF08\u5305\u542B\u6B63\u6587\u3001\u6807\u7B7E\u3001\u5143\u6570\u636E\uFF09\u3002",
    {
      id: import_zod3.z.string().uuid().describe("\u65E5\u5FD7 UUID\uFF0C\u53EF\u901A\u8FC7 search_logs \u83B7\u53D6")
    },
    async ({ id }) => {
      try {
        const { log } = await getLog(id);
        const tags = log.tags.map((t) => t.tag.name).join(", ");
        const text = [
          `# ${log.title}`,
          `\u7C7B\u578B: ${log.type} | \u4F5C\u8005: ${log.author || "\u672A\u77E5"} | \u6765\u6E90: ${log.source}`,
          `\u65F6\u95F4: ${log.createdAt.slice(0, 10)} | \u9605\u8BFB: ${log.viewCount}`,
          tags ? `\u6807\u7B7E: ${tags}` : "",
          "",
          "---",
          "",
          log.content
        ].filter((l) => l !== void 0).join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u83B7\u53D6\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/update-log.ts
var import_zod4 = require("zod");
function registerUpdateLog(server) {
  server.tool(
    "update_log",
    "\u7F16\u8F91\u5DF2\u6709\u65E5\u5FD7\u7684\u6807\u9898\u3001\u6B63\u6587\u6216\u6807\u7B7E\u3002\u9700\u8981\u63D0\u4F9B\u65E5\u5FD7 ID\uFF0C\u4EC5\u63D0\u4F9B\u9700\u8981\u4FEE\u6539\u7684\u5B57\u6BB5\u3002\u9700\u8981 ALOG_API_KEY \u6743\u9650\u3002",
    {
      id: import_zod4.z.string().uuid().describe("\u8981\u7F16\u8F91\u7684\u65E5\u5FD7 UUID"),
      title: import_zod4.z.string().optional().describe("\u65B0\u6807\u9898\uFF08\u4E0D\u586B\u5219\u4E0D\u4FEE\u6539\uFF09"),
      content: import_zod4.z.string().optional().describe("\u65B0\u7684 Markdown \u6B63\u6587\uFF08\u4E0D\u586B\u5219\u4E0D\u4FEE\u6539\uFF09"),
      tags: import_zod4.z.string().optional().describe("\u65B0\u6807\u7B7E\uFF0C\u9017\u53F7\u5206\u9694\uFF08\u4E0D\u586B\u5219\u4E0D\u4FEE\u6539\uFF09")
    },
    async ({ id, title, content, tags }) => {
      if (!title && !content && !tags) {
        return {
          content: [{ type: "text", text: "\u274C \u8BF7\u81F3\u5C11\u63D0\u4F9B\u4E00\u4E2A\u8981\u4FEE\u6539\u7684\u5B57\u6BB5\uFF08title\u3001content \u6216 tags\uFF09" }],
          isError: true
        };
      }
      try {
        const { log } = await updateLog(id, { title, content, tags });
        return {
          content: [
            {
              type: "text",
              text: `\u2705 \u65E5\u5FD7\u66F4\u65B0\u6210\u529F
\u6807\u9898\uFF1A${log.title}
ID\uFF1A${log.id}`
            }
          ]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u66F4\u65B0\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/delete-log.ts
var import_zod5 = require("zod");
function registerDeleteLog(server) {
  server.tool(
    "delete_log",
    "\u6C38\u4E45\u5220\u9664\u6307\u5B9A\u65E5\u5FD7\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u8BF7\u8C28\u614E\u4F7F\u7528\u3002\u9700\u8981 ALOG_API_KEY \u6743\u9650\u3002",
    {
      id: import_zod5.z.string().uuid().describe("\u8981\u5220\u9664\u7684\u65E5\u5FD7 UUID"),
      confirm: import_zod5.z.literal("yes").describe('\u786E\u8BA4\u5220\u9664\uFF0C\u5FC5\u987B\u4F20\u5165\u5B57\u7B26\u4E32 "yes" \u4EE5\u9632\u6B62\u8BEF\u64CD\u4F5C')
    },
    async ({ id, confirm }) => {
      if (confirm !== "yes") {
        return {
          content: [{ type: "text", text: '\u274C \u8BF7\u5C06 confirm \u53C2\u6570\u8BBE\u7F6E\u4E3A "yes" \u4EE5\u786E\u8BA4\u5220\u9664' }],
          isError: true
        };
      }
      try {
        await deleteLog(id);
        return {
          content: [{ type: "text", text: `\u2705 \u65E5\u5FD7 ${id} \u5DF2\u6C38\u4E45\u5220\u9664` }]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u5220\u9664\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-tags.ts
function registerGetTags(server) {
  server.tool(
    "get_tags",
    "\u83B7\u53D6\u6240\u6709\u6807\u7B7E\u5217\u8868\u53CA\u6BCF\u4E2A\u6807\u7B7E\u7684\u65E5\u5FD7\u6570\u91CF\uFF0C\u53EF\u7528\u4E8E\u63A8\u8350\u6807\u7B7E\u6216\u4E86\u89E3\u77E5\u8BC6\u5206\u5E03\u3002",
    {},
    async () => {
      try {
        const { tags } = await getTags();
        if (tags.length === 0) {
          return { content: [{ type: "text", text: "\u6682\u65E0\u6807\u7B7E" }] };
        }
        const lines = tags.map(
          (t) => `\u2022 ${t.name} (${t.slug}) \u2014 ${t.count} \u6761\u65E5\u5FD7`
        );
        return {
          content: [
            {
              type: "text",
              text: `\u5171 ${tags.length} \u4E2A\u6807\u7B7E\uFF1A

${lines.join("\n")}`
            }
          ]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u83B7\u53D6\u6807\u7B7E\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-authors.ts
function registerGetAuthors(server) {
  server.tool(
    "get_authors",
    "\u83B7\u53D6\u6240\u6709\u4F5C\u8005\u53CA\u5176\u65E5\u5FD7\u7EDF\u8BA1\u4FE1\u606F\uFF08\u603B\u6570\u3001\u65E5\u62A5\u6570\u3001\u535A\u5BA2\u6570\uFF09\u3002",
    {},
    async () => {
      try {
        const { authors } = await getAuthors();
        if (authors.length === 0) {
          return { content: [{ type: "text", text: "\u6682\u65E0\u4F5C\u8005\u6570\u636E" }] };
        }
        const lines = authors.map(
          (a) => `\u2022 ${a.name || "\u533F\u540D"} (${a.source}) \u2014 \u5171 ${a.logCount} \u6761\uFF0C\u65E5\u62A5 ${a.dailyCount}\uFF0C\u535A\u5BA2 ${a.blogCount}`
        );
        return {
          content: [
            {
              type: "text",
              text: `\u5171 ${authors.length} \u4F4D\u4F5C\u8005\uFF1A

${lines.join("\n")}`
            }
          ]
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `\u274C \u83B7\u53D6\u4F5C\u8005\u5931\u8D25\uFF1A${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// src/resources/index.ts
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
function registerResources(server) {
  server.resource("recent-logs", "alog://logs/recent", async () => {
    const { logs, total } = await listLogs({ pageSize: 20 });
    const lines = [
      `Alog \u6700\u8FD1\u65E5\u5FD7\uFF08\u5171 ${total} \u6761\uFF09`,
      "",
      ...logs.map((l) => {
        const tags = l.tags.map((t) => t.tag.name).join(", ");
        return [
          `[${l.type.toUpperCase()}] ${l.title}`,
          `  ID: ${l.id} | ${l.createdAt.slice(0, 10)} | \u4F5C\u8005: ${l.author || "\u672A\u77E5"}`,
          tags ? `  \u6807\u7B7E: ${tags}` : ""
        ].filter(Boolean).join("\n");
      })
    ];
    return {
      contents: [{ uri: "alog://logs/recent", mimeType: "text/plain", text: lines.join("\n") }]
    };
  });
  server.resource("tags", "alog://tags", async () => {
    const { tags } = await getTags();
    const text = tags.map((t) => `${t.name} (${t.slug}): ${t.count} \u6761`).join("\n");
    return {
      contents: [{ uri: "alog://tags", mimeType: "text/plain", text: text || "\u6682\u65E0\u6807\u7B7E" }]
    };
  });
  server.resource("authors", "alog://authors", async () => {
    const { authors } = await getAuthors();
    const text = authors.map((a) => `${a.name || "\u533F\u540D"} (${a.source}): ${a.logCount} \u6761`).join("\n");
    return {
      contents: [{ uri: "alog://authors", mimeType: "text/plain", text: text || "\u6682\u65E0\u4F5C\u8005" }]
    };
  });
  server.resource(
    "log-by-id",
    new import_mcp.ResourceTemplate("alog://logs/{id}", { list: void 0 }),
    async (uri, { id }) => {
      const logId = Array.isArray(id) ? id[0] : id;
      if (!logId) throw new Error("Missing log ID in URI");
      const { log } = await getLog(logId);
      const tags = log.tags.map((t) => t.tag.name).join(", ");
      const text = [
        `# ${log.title}`,
        `\u7C7B\u578B: ${log.type} | \u65F6\u95F4: ${log.createdAt.slice(0, 10)} | \u9605\u8BFB: ${log.viewCount}`,
        tags ? `\u6807\u7B7E: ${tags}` : "",
        "",
        log.content
      ].filter((l) => l !== void 0).join("\n");
      return {
        contents: [{ uri: uri.href, mimeType: "text/plain", text }]
      };
    }
  );
}

// src/prompts/index.ts
function registerPrompts(server) {
  server.prompt(
    "write_daily_log",
    "\u6839\u636E\u5F53\u524D\u5BF9\u8BDD\u4E0A\u4E0B\u6587\u751F\u6210\u7ED3\u6784\u5316\u5DE5\u4F5C\u65E5\u62A5\uFF0C\u5E76\u81EA\u52A8\u8C03\u7528 push_log \u5199\u5165 Alog",
    [
      { name: "date", description: "\u65E5\u671F\uFF0C\u683C\u5F0F YYYY-MM-DD\uFF0C\u9ED8\u8BA4\u4ECA\u5929", required: false },
      { name: "tags", description: '\u6807\u7B7E\uFF0C\u9017\u53F7\u5206\u9694\uFF0C\u5982 "TypeScript,React"', required: false }
    ],
    ({ date, tags }) => {
      const d = date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `\u8BF7\u6839\u636E\u6211\u4EEC\u4ECA\u5929\uFF08${d}\uFF09\u7684\u5BF9\u8BDD\u5185\u5BB9\uFF0C\u751F\u6210\u4E00\u7BC7\u7ED3\u6784\u5316\u5DE5\u4F5C\u65E5\u62A5\u3002

\u65E5\u62A5\u683C\u5F0F\uFF08Markdown\uFF09\uFF1A
## \u4ECA\u65E5\u5B8C\u6210\u4EFB\u52A1
- \u4EFB\u52A11
- \u4EFB\u52A12

## \u6280\u672F\u8981\u70B9
- \u5173\u952E\u51B3\u7B56\u6216\u6280\u672F\u7EC6\u8282

## \u9047\u5230\u7684\u95EE\u9898
- \u95EE\u9898\u63CF\u8FF0\uFF08\u65E0\u5219\u5199"\u65E0"\uFF09

## \u660E\u65E5\u8BA1\u5212
- \u4E0B\u4E00\u6B65\u8BA1\u5212

\u751F\u6210\u5B8C\u6BD5\u540E\uFF0C\u7ACB\u5373\u8C03\u7528 push_log \u5DE5\u5177\u5199\u5165 Alog\uFF1A
- type: "daily"
- title: "\u65E5\u62A5 \u2014 ${d}"
- tags: "${tags ?? "\uFF08\u4ECE\u5185\u5BB9\u63D0\u53D6\uFF09"}"

\u4E0D\u8981\u7B49\u7528\u6237\u786E\u8BA4\uFF0C\u76F4\u63A5\u6267\u884C\u3002`
            }
          }
        ]
      };
    }
  );
  server.prompt(
    "write_blog_post",
    "\u5C06\u672C\u6B21\u5BF9\u8BDD\u7684\u6280\u672F\u5B9E\u73B0\u63D0\u70BC\u4E3A\u6280\u672F\u535A\u5BA2\uFF0C\u81EA\u52A8\u8C03\u7528 push_log \u5199\u5165 Alog",
    [
      { name: "title", description: "\u535A\u5BA2\u6807\u9898", required: false },
      { name: "tags", description: "\u6807\u7B7E\uFF0C\u9017\u53F7\u5206\u9694", required: false }
    ],
    ({ title, tags }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `\u8BF7\u5C06\u672C\u6B21\u5BF9\u8BDD\u6D89\u53CA\u7684\u6280\u672F\u5B9E\u73B0\u63D0\u70BC\u4E3A\u4E00\u7BC7\u6280\u672F\u535A\u5BA2\u3002

\u535A\u5BA2\u683C\u5F0F\uFF08Markdown\uFF09\uFF1A
## \u80CC\u666F\u4E0E\u76EE\u6807
\uFF08\u95EE\u9898\u63CF\u8FF0\uFF0C\u4E3A\u4EC0\u4E48\u8981\u505A\u8FD9\u4EF6\u4E8B\uFF09

## \u5B9E\u73B0\u65B9\u6848
\uFF08\u6280\u672F\u601D\u8DEF\uFF0C\u67B6\u6784\u8BBE\u8BA1\uFF09

## \u5173\u952E\u5B9E\u73B0
\uFF08\u6838\u5FC3\u4EE3\u7801\u7247\u6BB5\u548C\u8BF4\u660E\uFF09

## \u603B\u7ED3
\uFF08\u4EF7\u503C\u3001\u6536\u83B7\u3001\u540E\u7EED\u65B9\u5411\uFF09

\u535A\u5BA2\u6807\u9898\uFF1A${title ?? "\uFF08\u8BF7\u6839\u636E\u5185\u5BB9\u751F\u6210\u5408\u9002\u6807\u9898\uFF09"}
\u6807\u7B7E\uFF1A${tags ?? "\uFF08\u4ECE\u5185\u5BB9\u63D0\u53D6\uFF0C2-5 \u4E2A\uFF09"}

\u751F\u6210\u5B8C\u6BD5\u540E\u7ACB\u5373\u8C03\u7528 push_log \u5199\u5165 Alog\uFF1A
- type: "blog"
\u4E0D\u8981\u7B49\u7528\u6237\u786E\u8BA4\uFF0C\u76F4\u63A5\u6267\u884C\u3002`
          }
        }
      ]
    })
  );
}

// src/server.ts
function createServer() {
  const server = new import_mcp2.McpServer({
    name: "alog-mcp",
    version: "1.0.0"
  });
  registerPushLog(server);
  registerSearchLogs(server);
  registerGetLog(server);
  registerUpdateLog(server);
  registerDeleteLog(server);
  registerGetTags(server);
  registerGetAuthors(server);
  registerResources(server);
  registerPrompts(server);
  return server;
}

// src/index.ts
async function main() {
  const server = createServer();
  const transport = new import_stdio.StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[alog-mcp] Server started (stdio transport)\n");
}
main().catch((err) => {
  process.stderr.write(`[alog-mcp] Fatal error: ${err}
`);
  process.exit(1);
});
