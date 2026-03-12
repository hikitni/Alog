# 第十章：Linux 服务器部署指南

## 10.1 前提条件

| 要求 | 说明 |
|------|------|
| 操作系统 | Ubuntu 20.04+ / Debian 11+ |
| Node.js | v22+（脚本自动安装）|
| 内存 | 最低 512MB，推荐 1GB |
| 磁盘 | 最低 1GB 可用空间 |
| 端口 | 80（HTTP）、443（HTTPS，可选）|

---

## 10.2 一键部署

```bash
# 克隆/上传 Alog 项目到服务器
git clone https://your-repo/alog.git  # 或 scp 上传

cd alog

# 执行部署脚本
bash deploy/deploy.sh
```

脚本自动完成：
1. 安装 Node.js 22
2. 安装 PM2 进程管理器
3. 安装 jq（供客户端 Shell 函数使用）
4. 创建目录结构 `/opt/alog/`
5. 安装依赖 + 构建项目
6. 执行数据库迁移
7. 配置 PM2 守护进程
8. 配置 Nginx 反向代理（若已安装）

---

## 10.3 手动部署步骤

### Step 1：安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # 验证：v22.x.x
```

### Step 2：安装 PM2

```bash
sudo npm install -g pm2
```

### Step 3：部署应用

```bash
# 创建目录
sudo mkdir -p /opt/alog/data
sudo chown -R $USER:$USER /opt/alog

# 复制项目文件
cp -r ./website /opt/alog/website

# 安装依赖
cd /opt/alog/website
npm ci

# 构建
npm run build

# 执行数据库迁移
npx prisma migrate deploy
```

### Step 4：配置环境变量

```bash
# 生成随机 Admin Token
ADMIN_TOKEN=$(openssl rand -hex 24)
echo "Admin Token: $ADMIN_TOKEN"  # 保存这个值！

# 写入环境配置
cat > /opt/alog/website/.env.production << EOF
DATABASE_URL="file:../../data/alog.db"
ADMIN_TOKEN="$ADMIN_TOKEN"
EOF
```

### Step 5：PM2 配置

```bash
# 复制 PM2 配置
cp ./deploy/ecosystem.config.cjs /opt/alog/

# 编辑配置中的 admin token
sed -i "s|change-this-in-production|$ADMIN_TOKEN|g" /opt/alog/ecosystem.config.cjs

# 启动服务
cd /opt/alog
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # 复制并执行输出的命令，设置开机自启
```

### Step 6：Nginx 配置

```bash
sudo apt install -y nginx

# 复制 Nginx 配置
sudo cp ./deploy/nginx.conf /etc/nginx/sites-available/alog

# 修改域名（替换 your-domain.com）
sudo nano /etc/nginx/sites-available/alog

# 启用配置
sudo ln -s /etc/nginx/sites-available/alog /etc/nginx/sites-enabled/alog
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10.4 HTTPS 配置（推荐）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请 SSL 证书（替换域名）
sudo certbot --nginx -d your-domain.com

# 证书自动续期（certbot 会自动配置 cron）
sudo certbot renew --dry-run
```

---

## 10.5 创建第一个 API Key

服务启动后，运行初始化向导：

```bash
# 在服务器上运行
cd /opt/alog/website
ADMIN_TOKEN="your-admin-token" node setup.mjs
```

向导会创建第一个 API Key 并输出配置指令，复制到本地机器的 Shell 配置文件。

---

## 10.6 项目目录结构（服务器）

```
/opt/alog/
├── website/               Next.js 应用
│   ├── .next/             构建产物
│   ├── node_modules/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── prisma/
│   ├── .env.production    生产环境变量
│   └── setup.mjs          初始化向导
├── data/
│   ├── alog.db            SQLite 数据库文件
│   └── backup/            定期备份目录（自动创建）
│       └── alog_YYYYMMDD_HHMMSS.db.gz
└── ecosystem.config.cjs   PM2 配置

/var/log/alog/             应用日志（PM2 输出）
├── out.log
└── error.log
```

---

## 10.7 日常运维

### PM2 管理命令

```bash
pm2 status          # 查看所有服务状态
pm2 logs alog       # 实时查看日志
pm2 logs alog --lines 100  # 查看最近100行
pm2 restart alog    # 重启服务
pm2 reload alog     # 零停机重启（推荐）
pm2 stop alog       # 停止服务
```

### 更新部署

```bash
cd /opt/alog/website

# 拉取新代码（若使用 git）
git pull

# 安装依赖（如有变化）
npm ci

# 构建
npm run build

# 执行迁移（如 schema 有变化）
npx prisma migrate deploy

# 零停机重启
pm2 reload alog
```

### 数据库备份

Alog 使用 `deploy/backup.sh` 脚本进行自动备份，备份到 `data/backup/` 目录。

**备份策略**

| 项目 | 值 |
|------|----|
| 执行频率 | 每 2 天一次（crontab 控制）|
| 执行时间 | 凌晨 3:00 |
| 保留策略 | 60 天内，超期自动删除 |
| 备份目录 | `/home/alog/alog/data/backup/` |
| 备份格式 | `alog_YYYYMMDD_HHMMSS.db.gz`（gzip 压缩）|
| 备份方式 | `sqlite3 .backup`（安全，支持 WAL 模式）|

**初次配置（部署后执行一次）**

```bash
# 1. 复制备份脚本到服务器（已在项目 deploy/ 目录中）
cd /home/alog/alog

# 2. 添加可执行权限
chmod +x deploy/backup.sh

# 3. 手动执行一次验证
bash deploy/backup.sh
# 输出示例：
# [2026-03-12 16:42:59] ✅ 备份完成: alog_20260312_164259.db.gz (24K)
# [2026-03-12 16:42:59] 📦 当前备份总数: 1 个

# 4. 写入 crontab（每 2 天凌晨 3 点自动执行）
(crontab -l 2>/dev/null; echo '0 3 */2 * * /home/alog/alog/deploy/backup.sh >> /home/alog/alog/logs/backup.log 2>&1') | crontab -

# 5. 确认 crontab 已写入
crontab -l
```

**日常运维**

```bash
# 查看备份日志
tail -f /home/alog/alog/logs/backup.log

# 查看当前备份文件列表
ls -lh /home/alog/alog/data/backup/

# 手动触发一次备份
bash /home/alog/alog/deploy/backup.sh

# 从备份恢复（停止服务后执行）
pm2 stop alog
cp /home/alog/alog/data/alog.db /home/alog/alog/data/alog.db.bak  # 保留当前
gunzip -c /home/alog/alog/data/backup/alog_YYYYMMDD_HHMMSS.db.gz > /home/alog/alog/data/alog.db
pm2 start alog
```

> **注意**：备份脚本依赖 `sqlite3` CLI。若服务器未安装，脚本会自动降级为 `cp` 方式。  
> 安装命令：`sudo apt-get install -y sqlite3`

---

## 10.8 环境变量参考

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | SQLite 文件路径（`file:../../data/alog.db`）|
| `ADMIN_TOKEN` | ✅ | API Key 管理认证 Token，**必须修改** |
| `NODE_ENV` | — | 由 PM2 自动设置为 `production` |

---

## 10.9 安全建议

- ✅ 修改默认 `ADMIN_TOKEN`（使用 `openssl rand -hex 24` 生成）
- ✅ 配置 HTTPS（通过 certbot）
- ✅ 将 `data/` 目录加入定期备份
- ✅ 不要将 `.env.production` 提交到 Git
- ✅ 定期更新 Node.js 和依赖包
- ⚠️ `GET /api/logs` 和 `GET /api/tags` 无需认证，为公开接口（如需保护可在 Nginx 层限制）
