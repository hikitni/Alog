#!/usr/bin/env bash
# ============================================================
# Alog 服务器端热更新脚本（由 GitHub Actions 远程调用）
# 适用于: Ubuntu 22.04 / PM2 管理的 Next.js 项目
# 前置条件: 首次部署已通过 deploy.sh 完成
# ============================================================
set -e

DEPLOY_DIR="/home/alog/alog"
WEBSITE_DIR="$DEPLOY_DIR/website"
LOG_DIR="$DEPLOY_DIR/logs"
REPO_URL="https://github.com/2634213728/Alog.git"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "=========================================="
echo "  Alog 更新脚本 - $TIMESTAMP"
echo "=========================================="

# ---------- 1. 拉取最新代码 ----------
echo ""
echo "▶ [1/5] 拉取最新代码..."
if [ ! -d "$DEPLOY_DIR/.git" ]; then
  echo "⚠️  目录不存在或非 git 仓库，执行首次克隆..."
  mkdir -p "$DEPLOY_DIR"
  git clone "$REPO_URL" "$DEPLOY_DIR"
else
  cd "$DEPLOY_DIR"
  # 每次更新 remote URL（确保 Token 最新）
  git remote set-url origin "$REPO_URL"
  git pull origin main
fi
echo "✅ 代码更新完成"

# ---------- 2. 安装/更新依赖 ----------
echo ""
echo "▶ [2/5] 安装依赖..."

# 首次部署：若 .env.production 不存在则自动生成
ENV_FILE="$WEBSITE_DIR/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  未找到 .env.production，自动生成..."
  mkdir -p "$WEBSITE_DIR"
  ADMIN_TOKEN=$(openssl rand -hex 24)
  cat > "$ENV_FILE" << EOF
DATABASE_URL="file:../../data/alog.db"
ADMIN_TOKEN="$ADMIN_TOKEN"
EOF
  echo "✅ 已生成 .env.production（ADMIN_TOKEN=$ADMIN_TOKEN）"
  echo "   ⚠️  请保存此 Token，后续无法再次查看！"
fi

# 首次部署：确保数据目录存在
mkdir -p "$DEPLOY_DIR/data"

cd "$WEBSITE_DIR"
# 使用 npm ci 保证与 package-lock.json 一致
npm ci --production=false
echo "✅ 依赖安装完成"

# ---------- 3. 生成 Prisma Client ----------
echo ""
echo "▶ [3/6] 生成 Prisma Client..."
npx prisma generate
echo "✅ Prisma Client 生成完成"

# ---------- 4. 构建项目 ----------
echo ""
echo "▶ [4/6] 构建 Next.js 项目..."
npm run build
echo "✅ 构建完成"

# ---------- 5. 数据库迁移 ----------
echo ""
echo "▶ [5/6] 执行数据库迁移..."
npx prisma migrate deploy
echo "✅ 数据库迁移完成"

# ---------- 6. 重载 PM2（零停机） ----------
echo ""
echo "▶ [6/6] 重载 PM2 进程..."
# reload 会进行滚动重启，实现零停机
# 若进程不存在则使用 start
if pm2 describe alog > /dev/null 2>&1; then
  pm2 reload alog --update-env
else
  echo "⚠️  PM2 进程 alog 不存在，尝试启动..."
  cd "$DEPLOY_DIR"
  pm2 start ecosystem.config.cjs
  pm2 save
fi
echo "✅ PM2 重载完成"

# ---------- 完成摘要 ----------
echo ""
echo "=========================================="
echo "  ✅ 部署成功！"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  提交: $(git -C "$DEPLOY_DIR" rev-parse --short HEAD)"
echo "=========================================="
echo ""
echo "📊 当前 PM2 状态:"
pm2 list
