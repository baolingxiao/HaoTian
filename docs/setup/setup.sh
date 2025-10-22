#!/bin/bash

echo "🚀 AI Chatpot 快速设置脚本"
echo "================================"

# 检查是否已存在 .env.local
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local 已存在，跳过创建"
else
    echo "📝 创建 .env.local 文件..."
    cp env.example .env.local
    echo "✅ 已创建 .env.local，请编辑填入真实配置"
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker 未运行，请先启动 Docker"
    echo "   然后运行: docker compose up -d"
else
    echo "🐳 启动 PostgreSQL 数据库..."
    docker compose up -d
    echo "✅ 数据库已启动"
fi

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 5

# 推送数据库模式
echo "🗄️  推送数据库模式..."
pnpm db:push

echo ""
echo "🎉 设置完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env.local 填入真实配置"
echo "2. 运行: pnpm dev"
echo "3. 访问: http://localhost:3000"
echo ""
echo "需要配置的服务："
echo "- PostgreSQL: 已通过 Docker 启动"
echo "- OpenAI API: 从 https://platform.openai.com 获取"
echo "- 邮件服务: Gmail/SendGrid/Mailgun 等"
echo "- Redis: Upstash (可选，用于限流)"

