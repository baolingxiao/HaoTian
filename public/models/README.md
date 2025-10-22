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
