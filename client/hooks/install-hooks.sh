#!/bin/sh
# 安装 Git Hooks 脚本
# 用法：在项目根目录执行 sh client/hooks/install-hooks.sh

HOOKS_DIR=".git/hooks"
SOURCE_DIR="client/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ 未找到 .git/hooks 目录，请在项目根目录执行此脚本"
  exit 1
fi

# 安装 pre-commit hook
cp "$SOURCE_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ pre-commit hook 安装成功"

echo ""
echo "已安装的 Git Hooks："
echo "  - pre-commit：提交前检查 CHANGELOG.md 是否已更新"
echo ""
echo "如需跳过检查（WIP 提交），使用：git commit --no-verify"
