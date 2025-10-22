#!/bin/bash

# AI Chatpot 项目健康检查脚本
# 用于检测项目配置和运行状态

set -e

echo "🔍 AI Chatpot - 项目健康检查"
echo "=============================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASSED=0
FAILED=0
WARNINGS=0

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2 已安装: $(command -v $1)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 未安装"
        ((FAILED++))
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
        return 1
    fi
}

# 1. 检查必需工具
echo "📦 检查必需工具..."
check_command "node" "Node.js"
check_command "pnpm" "pnpm"
check_command "docker" "Docker"

echo ""

# 2. 检查 Node.js 版本
echo "🔢 检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js 版本符合要求: v$(node -v | cut -d'v' -f2)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Node.js 版本过低（需要 18.x 或更高）: v$(node -v | cut -d'v' -f2)"
    ((FAILED++))
fi

echo ""

# 3. 检查项目文件
echo "📁 检查项目文件..."
check_file "package.json" "package.json 存在"
check_file "next.config.mjs" "next.config.mjs 存在"
check_file "tsconfig.json" "tsconfig.json 存在"
check_file "prisma/schema.prisma" "Prisma schema 存在"

echo ""

# 4. 检查环境变量
echo "🔐 检查环境变量配置..."
if check_file ".env.local" ".env.local 存在"; then
    # 检查关键环境变量
    if grep -q "OPENAI_API_KEY=sk-" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY 已配置"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} OPENAI_API_KEY 未配置或无效"
        ((FAILED++))
    fi
    
    if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓${NC} DATABASE_URL 已配置"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} DATABASE_URL 未配置"
        ((FAILED++))
    fi
    
    if grep -q "NEXTAUTH_SECRET=" .env.local 2>/dev/null && ! grep -q "NEXTAUTH_SECRET=xxx" .env.local; then
        echo -e "${GREEN}✓${NC} NEXTAUTH_SECRET 已配置"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} NEXTAUTH_SECRET 未配置或使用默认值"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} 建议从 env.local.example 复制并配置 .env.local"
fi

echo ""

# 5. 检查依赖安装
echo "📚 检查项目依赖..."
if check_directory "node_modules" "node_modules 存在"; then
    # 检查关键依赖
    if [ -d "node_modules/next" ]; then
        echo -e "${GREEN}✓${NC} Next.js 已安装"
        ((PASSED++))
    fi
    if [ -d "node_modules/react" ]; then
        echo -e "${GREEN}✓${NC} React 已安装"
        ((PASSED++))
    fi
    if [ -d "node_modules/openai" ]; then
        echo -e "${GREEN}✓${NC} OpenAI SDK 已安装"
        ((PASSED++))
    fi
    if [ -d "node_modules/@prisma/client" ]; then
        echo -e "${GREEN}✓${NC} Prisma Client 已安装"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} 请运行 'pnpm install' 安装依赖"
fi

echo ""

# 6. 检查 Docker 服务
echo "🐳 检查 Docker 服务..."
if command -v docker &> /dev/null; then
    if docker compose ps | grep -q "db.*Up" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL 容器正在运行"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL 容器未运行（如使用云数据库可忽略）"
        ((WARNINGS++))
    fi
fi

echo ""

# 7. 检查 Tauri 配置（可选）
echo "🖥️  检查 Tauri 配置（桌面应用）..."
if check_directory "src-tauri" "src-tauri 目录存在"; then
    check_file "src-tauri/tauri.conf.json" "Tauri 配置文件存在"
    check_file "src-tauri/Cargo.toml" "Cargo.toml 存在"
    
    if command -v rustc &> /dev/null; then
        echo -e "${GREEN}✓${NC} Rust 已安装: $(rustc --version)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Rust 未安装（桌面应用需要）"
        ((WARNINGS++))
    fi
fi

echo ""

# 8. 检查网络连接
echo "🌐 检查网络连接..."
if curl -s --max-time 5 https://api.openai.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 可以访问 OpenAI API"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 无法访问 OpenAI API（可能是网络问题）"
    ((WARNINGS++))
fi

echo ""

# 9. 检查端口占用
echo "🔌 检查端口占用..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} 端口 3000 已被占用"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓${NC} 端口 3000 可用"
    ((PASSED++))
fi

if lsof -i :5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 端口 5432 已在使用（PostgreSQL）"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} 端口 5432 未使用（如使用云数据库可忽略）"
    ((WARNINGS++))
fi

echo ""

# 总结
echo "=============================="
echo "📊 检查结果统计"
echo "=============================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}警告: $WARNINGS${NC}"
echo ""

# 根据结果给出建议
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 太棒了！项目配置完美，可以开始使用了！${NC}"
    echo ""
    echo "启动命令:"
    echo "  pnpm dev          # Web 应用"
    echo "  pnpm tauri:dev    # 桌面应用"
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  项目基本正常，但有一些警告。${NC}"
    echo "建议查看上述警告并根据需要修复。"
elif [ $FAILED -le 3 ]; then
    echo -e "${YELLOW}⚠️  发现少量问题，建议修复后再启动。${NC}"
    echo ""
    echo "常见解决方法:"
    echo "  1. 安装依赖: pnpm install"
    echo "  2. 配置环境变量: cp env.local.example .env.local"
    echo "  3. 启动数据库: docker compose up -d"
else
    echo -e "${RED}❌ 发现多个关键问题，请先解决。${NC}"
    echo ""
    echo "建议步骤:"
    echo "  1. 安装 Node.js 18+: https://nodejs.org/"
    echo "  2. 安装 pnpm: npm install -g pnpm"
    echo "  3. 安装依赖: pnpm install"
    echo "  4. 配置环境变量: cp env.local.example .env.local"
    echo "  5. 查看完整手册: USER_MANUAL.md"
fi

echo ""
echo "📖 更多帮助:"
echo "  - 使用手册: USER_MANUAL.md"
echo "  - 桌面应用: TAURI_DESKTOP_GUIDE.md"
echo "  - README: README.md"

exit 0

