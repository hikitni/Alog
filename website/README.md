# Alog — Website

Alog 平台的 Next.js 前端 + API 服务。

## 开发

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 构建

```bash
npm run build
npm start
```

## 环境变量

创建 `.env` 文件（已在 `.gitignore` 中）：

```env
DATABASE_URL="file:../../data/alog.db"
ADMIN_TOKEN="your-admin-token"
```

## 项目说明

详见根目录 [README.md](../README.md) 和 [docs/](../docs/) 设计文档。

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
