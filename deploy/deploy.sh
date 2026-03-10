#!/usr/bin/env bash
# ============================================================
# Alog Linux 服务器部署脚本
# 适用系统: Ubuntu 20.04+ / Debian 11+
# 用法: bash deploy.sh
# ============================================================
set -e

echo "🚀 开始部署 Alog..."

DEPLOY_DIR="/home/alog/alog"
DATA_DIR="/home/alog/alog/data"
LOG_DIR="/home/alog/alog/logs"
ADMIN_TOKEN="${ADMIN_TOKEN:-$(openssl rand -hex 24)}"

# 1. 安装 Node.js（若未安装）
if ! command -v node &> /dev/null; then
  echo "📦 安装 Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 2. 安装 PM2（若未安装）
if ! command -v pm2 &> /dev/null; then
  echo "📦 安装 PM2..."
  sudo npm install -g pm2
fi

# 3. 安装 jq（供 Shell 函数使用）
if ! command -v jq &> /dev/null; then
  echo "📦 安装 jq..."
  sudo apt-get install -y jq
fi

# 4. 创建目录
echo "📁 创建目录..."
sudo mkdir -p "$DEPLOY_DIR" "$DATA_DIR" "$LOG_DIR"
sudo chown -R "$USER":"$USER" "$DEPLOY_DIR" "$LOG_DIR"

# 5. 复制项目文件
echo "📂 复制项目文件..."
cp -r ./website/* "$DEPLOY_DIR/website/"

# 6. 安装依赖 & 构建
echo "📦 安装依赖..."
cd "$DEPLOY_DIR/website"
npm ci --production=false

echo "🔨 构建项目..."
npm run build

# 7. 执行数据库迁移
echo "🗄️  初始化数据库..."
npx prisma migrate deploy

# 8. 写入环境变量
echo "⚙️  配置环境变量..."
cat > "$DEPLOY_DIR/website/.env.production" << EOF
DATABASE_URL="file:../../data/alog.db"
ADMIN_TOKEN="$ADMIN_TOKEN"
EOF

# 9. 配置 PM2
echo "⚙️  配置 PM2..."
cp ../deploy/ecosystem.config.cjs "$DEPLOY_DIR/"
# 替换路径
sed -i "s|/home/alog/alog/website|$DEPLOY_DIR/website|g" "$DEPLOY_DIR/ecosystem.config.cjs"
sed -i "s|change-this-in-production|$ADMIN_TOKEN|g" "$DEPLOY_DIR/ecosystem.config.cjs"

cd "$DEPLOY_DIR"
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | sudo bash

# 10. 配置 Nginx（可选）
if command -v nginx &> /dev/null; then
  echo "⚙️  配置 Nginx..."
  sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/alog
  sudo ln -sf /etc/nginx/sites-available/alog /etc/nginx/sites-enabled/alog
  sudo nginx -t && sudo systemctl reload nginx
  echo "✅ Nginx 配置完成"
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "📌 重要信息（请保存）："
echo "   服务地址:    http://your-server-ip:3000"
echo "   管理员 Token: $ADMIN_TOKEN"
echo ""
echo "📖 下一步："
echo "   1. 运行初始化向导创建 API Key:"
echo "      node $DEPLOY_DIR/website/setup.mjs"
echo "   2. 在本地机器安装 Shell 函数:"
echo "      bash client/install.sh"
echo "   3. 复制对应 AI 工具规则文件到你的项目"
echo ""
echo "📊 管理命令:"
echo "   pm2 status        查看服务状态"
echo "   pm2 logs alog     查看日志"
echo "   pm2 restart alog  重启服务"
