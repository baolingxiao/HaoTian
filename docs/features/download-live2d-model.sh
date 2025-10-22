#!/bin/bash

# 下载 Live2D 官方示例模型

set -e

echo "📥 下载 Live2D 示例模型..."
echo ""

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    echo "请访问 https://git-scm.com/ 安装 Git"
    echo ""
    echo "或手动下载模型："
    echo "  1. 访问: https://github.com/guansss/pixi-live2d-display/tree/master/test/models/hiyori"
    echo "  2. 下载所有文件到: public/models/live2d/hiyori/"
    exit 1
fi

# 创建临时目录
echo "📁 创建临时目录..."
rm -rf temp-live2d
mkdir -p temp-live2d

# 克隆仓库
echo "⬇️  克隆仓库..."
git clone --depth 1 --single-branch https://github.com/guansss/pixi-live2d-display.git temp-live2d

# 创建目标目录
mkdir -p public/models/live2d

# 复制模型文件
echo "📦 复制模型文件..."

# Hiyori 模型
if [ -d "temp-live2d/test/models/hiyori" ]; then
    cp -r temp-live2d/test/models/hiyori public/models/live2d/
    echo "✅ Hiyori 模型下载完成"
else
    echo "⚠️  Hiyori 模型未找到"
fi

# Shizuku 模型（可选）
if [ -d "temp-live2d/test/models/shizuku" ]; then
    cp -r temp-live2d/test/models/shizuku public/models/live2d/
    echo "✅ Shizuku 模型下载完成"
fi

# Epsilon 模型（可选）
if [ -d "temp-live2d/test/models/epsilon" ]; then
    cp -r temp-live2d/test/models/epsilon public/models/live2d/
    echo "✅ Epsilon 模型下载完成"
fi

# 清理临时文件
echo "🧹 清理临时文件..."
rm -rf temp-live2d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 模型下载完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "下载的模型:"
find public/models/live2d -name "*.model*.json" -o -name "*.model.json" | while read file; do
    echo "  • $file"
done
echo ""
echo "下一步:"
echo "  1. 修改 src/app/avatar-chat/page.tsx 中的 modelPath"
echo "  2. 改为: \"/models/live2d/hiyori/hiyori.model3.json\""
echo "  3. 运行: pnpm dev"
echo "  4. 访问: http://localhost:3000/avatar-chat"
echo ""

