#!/bin/bash

# Tauri 桌面应用快速设置脚本

set -e

echo "🚀 AI Chatpot - Tauri Desktop Setup"
echo "===================================="
echo ""

# 检查 Rust 是否安装
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust 未安装"
    echo "📦 请先安装 Rust: https://www.rust-lang.org/tools/install"
    echo ""
    echo "运行以下命令："
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

echo "✅ Rust 已安装: $(rustc --version)"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "📦 请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装"
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm 已安装: $(pnpm --version)"
echo ""

# 安装依赖
echo "📦 安装 Node.js 依赖..."
pnpm install

echo ""
echo "✅ 设置完成！"
echo ""
echo "🎯 下一步："
echo "  1. 开发模式: pnpm tauri:dev"
echo "  2. 构建应用: pnpm tauri:build"
echo ""
echo "📖 查看详细文档: TAURI_DESKTOP_GUIDE.md"
echo ""

