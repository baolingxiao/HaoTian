#!/bin/bash

# Live2D/VRM 角色快速设置脚本

set -e

echo "🎭 Live2D/VRM 角色设置向导"
echo "=============================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 创建必要的目录
echo "📁 创建目录结构..."
mkdir -p public/models/live2d
mkdir -p public/models/vrm
mkdir -p public/assets/images

echo -e "${GREEN}✓${NC} 目录创建完成"
echo ""

# 2. 提供模型获取方式
echo "🎨 获取 Live2D 模型的方式："
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "方式 1️⃣: 下载官方示例模型（推荐，免费）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hiyori 模型（Live2D 官方）:"
echo "  1. 访问: ${BLUE}https://github.com/guansss/pixi-live2d-display/tree/master/test/models/hiyori${NC}"
echo "  2. 下载所有文件到: ${YELLOW}public/models/live2d/hiyori/${NC}"
echo ""
echo "或使用命令下载（需要 git）:"
echo "  ${YELLOW}git clone --depth 1 https://github.com/guansss/pixi-live2d-display.git temp${NC}"
echo "  ${YELLOW}cp -r temp/test/models/hiyori public/models/live2d/${NC}"
echo "  ${YELLOW}rm -rf temp${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "方式 2️⃣: 使用 CDN（无需下载）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "在代码中直接使用 CDN 链接:"
echo "  ${BLUE}https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json${NC}"
echo ""
echo "修改 ${YELLOW}src/app/avatar-chat/page.tsx${NC} 中的 modelUrl 为上述 CDN 链接"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "方式 3️⃣: 下载其他免费模型"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "免费资源:"
echo "  • Live2D 官方示例: ${BLUE}https://www.live2d.com/en/download/sample-data/${NC}"
echo "  • GitHub 社区: ${BLUE}https://github.com/topics/live2d-model${NC}"
echo "  • VRoid Hub (VRM): ${BLUE}https://hub.vroid.com${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 3. 检查是否已有模型
if [ -d "public/models/live2d" ]; then
    MODEL_COUNT=$(find public/models/live2d -name "*.model3.json" | wc -l)
    if [ $MODEL_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓${NC} 找到 $MODEL_COUNT 个 Live2D 模型"
        echo ""
        echo "模型列表:"
        find public/models/live2d -name "*.model3.json" -exec echo "  • {}" \;
        echo ""
    else
        echo -e "${YELLOW}⚠${NC} 未找到 Live2D 模型文件"
        echo ""
    fi
fi

# 4. 提供快速测试命令
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 快速测试步骤:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 如果使用 CDN（无需下载模型）:"
echo "   ${YELLOW}pnpm dev${NC}"
echo "   访问: ${BLUE}http://localhost:3000/avatar-chat${NC}"
echo ""
echo "2. 如果下载了本地模型:"
echo "   • 确保模型文件在 ${YELLOW}public/models/live2d/your-model/${NC}"
echo "   • 修改 ${YELLOW}src/app/avatar-chat/page.tsx${NC} 中的 modelUrl"
echo "   • 运行: ${YELLOW}pnpm dev${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. 创建示例配置文件
echo "📝 创建配置文件..."

cat > public/models/avatar-config.example.json << 'EOF'
{
  "models": [
    {
      "name": "Hiyori (CDN)",
      "type": "live2d",
      "url": "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
      "scale": 0.15,
      "position": { "x": 0, "y": 0 },
      "description": "Official Live2D sample model"
    },
    {
      "name": "Shizuku (CDN)",
      "type": "live2d",
      "url": "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/shizuku/shizuku.model.json",
      "scale": 0.2,
      "position": { "x": 0, "y": 0 },
      "description": "Official Live2D sample model"
    },
    {
      "name": "Local Model",
      "type": "live2d",
      "url": "/models/live2d/your-model/model.model3.json",
      "scale": 0.15,
      "position": { "x": 0, "y": 0 },
      "description": "Your local model"
    }
  ]
}
EOF

echo -e "${GREEN}✓${NC} 配置文件创建: ${YELLOW}public/models/avatar-config.example.json${NC}"
echo ""

# 6. 创建 README
cat > public/models/README.md << 'EOF'
# Live2D/VRM 模型目录

## 目录结构

```
models/
├── live2d/              # Live2D 模型
│   └── your-model/
│       ├── model.model3.json
│       ├── model.moc3
│       ├── textures/
│       ├── motions/
│       └── expressions/
├── vrm/                 # VRM 模型
│   └── your-character.vrm
└── avatar-config.json   # 模型配置
```

## 获取模型

### Live2D 模型

1. **官方示例（免费）**:
   - Hiyori: https://github.com/guansss/pixi-live2d-display/tree/master/test/models/hiyori
   - 下载后放到 `live2d/hiyori/` 目录

2. **CDN 方式（推荐）**:
   - 无需下载，直接在代码中使用 CDN 链接
   - 示例: `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json`

3. **其他资源**:
   - Live2D 官方: https://www.live2d.com/en/download/sample-data/
   - GitHub: https://github.com/topics/live2d-model

### VRM 模型

1. **VRoid Hub**: https://hub.vroid.com
2. **VRoid Studio**: 自己制作角色

## 配置模型

编辑 `src/app/avatar-chat/page.tsx`:

```typescript
const modelUrl = '/models/live2d/your-model/model.model3.json';
// 或使用 CDN
const modelUrl = 'https://cdn.jsdelivr.net/gh/.../model.model3.json';
```

## 文件大小建议

- Live2D 模型: 通常 1-5 MB
- VRM 模型: 通常 5-20 MB
- 纹理优化: 使用 512x512 或 1024x1024

## 注意事项

1. **版权**: 确保有模型使用权
2. **性能**: 大文件会影响加载速度
3. **格式**: 仅支持 Live2D Cubism 3.x+ 和 VRM 0.0/1.0

## 测试

运行开发服务器:
```bash
pnpm dev
```

访问: http://localhost:3000/avatar-chat

## 更多帮助

查看完整文档: [AVATAR_GUIDE.md](../../AVATAR_GUIDE.md)
EOF

echo -e "${GREEN}✓${NC} README 创建: ${YELLOW}public/models/README.md${NC}"
echo ""

# 7. 检查依赖
echo "📦 检查依赖..."
if [ -d "node_modules/pixi-live2d-display-lipsyncpatch" ]; then
    echo -e "${GREEN}✓${NC} Live2D 依赖已安装"
else
    echo -e "${YELLOW}⚠${NC} Live2D 依赖未安装，运行: ${YELLOW}pnpm install${NC}"
fi
echo ""

# 8. 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Live2D 角色设置完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 下一步:"
echo ""
echo "1. 选择模型获取方式（推荐使用 CDN）"
echo "2. 启动开发服务器: ${YELLOW}pnpm dev${NC}"
echo "3. 访问角色页面: ${BLUE}http://localhost:3000/avatar-chat${NC}"
echo ""
echo "📖 完整文档:"
echo "  • Avatar 指南: ${YELLOW}AVATAR_GUIDE.md${NC}"
echo "  • 模型配置: ${YELLOW}public/models/README.md${NC}"
echo "  • 用户手册: ${YELLOW}USER_MANUAL.md${NC}"
echo ""
echo "💡 提示:"
echo "  如果不想下载模型，代码已配置 CDN 链接，可直接运行！"
echo ""
EOF

chmod +x setup-avatar.sh

echo -e "${GREEN}✓${NC} 设置脚本创建完成"
echo ""

