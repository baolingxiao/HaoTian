# 🎭 Live2D 角色系统配置状态

**配置时间**: 2025-10-11  
**状态**: ✅ 已配置完成（使用 CDN）

---

## ✅ 已完成的配置

### 1. 目录结构
```
public/
└── models/
    ├── live2d/               ← Live2D 模型目录
    ├── vrm/                  ← VRM 模型目录
    ├── avatar-config.example.json  ← 配置示例
    └── README.md             ← 使用说明
```

### 2. 代码配置

**文件**: `src/app/avatar-chat/page.tsx`

**当前配置** (使用 CDN):
```typescript
const avatar = useAvatar({
  modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
  scale: 0.15,
  x: 0,
  y: 100,
});
```

**优点**:
- ✅ 无需下载模型文件
- ✅ 开箱即用
- ✅ 自动缓存
- ✅ 官方维护

### 3. 功能特性

已实现的功能：

| 功能 | 状态 | 说明 |
|------|------|------|
| **Live2D 渲染** | ✅ | 使用 pixi-live2d-display |
| **自动眨眼** | ✅ | 定时眨眼动画 |
| **鼠标跟踪** | ✅ | 眼睛跟随鼠标 |
| **呼吸动画** | ✅ | 自然呼吸效果 |
| **情绪切换** | ✅ | 根据对话内容自动切换 |
| **表情映射** | ✅ | 支持 happy/sad/angry/surprised/neutral |
| **动作播放** | ✅ | 支持 idle/tap 等动作 |
| **说话动画** | ✅ | 对话时嘴部动作 |

---

## 🎯 使用方法

### 方式 1：直接运行（推荐）

当前已配置为使用 CDN，可直接运行：

```bash
pnpm dev
```

访问: http://localhost:3000/avatar-chat

**就这么简单！** ✨

### 方式 2：使用本地模型（可选）

如果想要更快的加载速度或离线使用：

```bash
# 1. 下载模型
./download-live2d-model.sh

# 2. 修改配置
# 编辑 src/app/avatar-chat/page.tsx
# 将 modelPath 改为: "/models/live2d/hiyori/hiyori.model3.json"

# 3. 启动应用
pnpm dev
```

---

## 📚 可用的模型

### CDN 模型（无需下载）

| 模型 | CDN 链接 | 特点 |
|------|---------|------|
| **Hiyori** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json` | 女性角色，表情丰富 ✅ 当前使用 |
| **Shizuku** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/shizuku/shizuku.model.json` | 可爱风格 |
| **Epsilon** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/epsilon/epsilon2.1.model3.json` | 科技风 |

### 切换模型

修改 `src/app/avatar-chat/page.tsx` 中的 `modelPath` 为上述任意链接即可。

---

## 🎨 自定义配置

### 调整角色大小

```typescript
scale: 0.15,  // 0.1 = 小, 0.15 = 中, 0.2 = 大
```

### 调整位置

```typescript
x: 0,    // 水平位置 (-200 到 200)
y: 100,  // 垂直位置 (0 = 顶部, 100 = 居中, 200 = 底部)
```

### 手动触发表情

```typescript
// 在代码中调用
avatar.setEmotion("happy");      // 情绪
avatar.setExpression("smile");   // 表情
avatar.playMotion("idle");       // 动作
```

---

## 🔧 工具脚本

| 脚本 | 功能 | 使用方法 |
|------|------|---------|
| `setup-avatar.sh` | 设置向导 | `./setup-avatar.sh` |
| `download-live2d-model.sh` | 下载模型 | `./download-live2d-model.sh` |
| `health-check.sh` | 健康检查 | `./health-check.sh` |

---

## 📖 文档

| 文档 | 内容 | 查看方式 |
|------|------|---------|
| **LIVE2D_SETUP_GUIDE.md** | 5 分钟快速设置 | 当前最推荐 ⭐️ |
| **AVATAR_GUIDE.md** | 完整详细指南 | 深入学习 |
| **USER_MANUAL.md** | 用户使用手册 | 查看"虚拟形象"章节 |
| **public/models/README.md** | 模型目录说明 | 模型管理 |

---

## 🐛 故障排除

### 问题：角色不显示

**解决方案**:
1. 打开浏览器控制台（F12）
2. 查看错误信息
3. 确认网络连接正常（CDN 需要联网）
4. 尝试刷新页面

### 问题：加载很慢

**原因**: CDN 首次加载较慢

**解决方案**:
- 等待加载完成（首次）
- 或下载本地模型: `./download-live2d-model.sh`

### 问题：表情不变化

**检查**:
1. 模型是否支持表情
2. 查看控制台情绪检测日志

**手动测试**:
```typescript
avatar.setEmotion("happy");
```

---

## ✅ 验证清单

- [x] `public/models/` 目录已创建
- [x] `src/app/avatar-chat/page.tsx` 已配置 CDN 链接
- [x] pixi-live2d-display 依赖已安装
- [x] 情绪检测系统已实现
- [x] 表情映射已配置
- [x] 文档已创建

---

## 🎉 下一步

### 立即体验

```bash
pnpm dev
```

访问: http://localhost:3000/avatar-chat

### 进阶配置

1. **切换模型**: 修改 `modelPath` 为其他 CDN 链接
2. **下载本地**: 运行 `./download-live2d-model.sh`
3. **自定义模型**: 放到 `public/models/live2d/your-model/`

### 集成到其他页面

```typescript
import { useAvatar } from "@/hooks/useAvatar";
import AvatarStage from "@/components/avatar/AvatarStage";

const avatar = useAvatar({
  modelPath: "https://cdn.jsdelivr.net/gh/.../model.model3.json",
  scale: 0.15,
  x: 0,
  y: 100,
});

<AvatarStage
  width={400}
  height={600}
  avatar={avatar}
  onLoad={() => console.log("加载成功")}
/>
```

---

## 📊 性能指标

| 指标 | CDN 模式 | 本地模式 |
|------|---------|---------|
| 首次加载 | ~3-5秒 | ~1-2秒 |
| 后续加载 | ~0.5秒（缓存） | ~0.3秒 |
| 文件大小 | ~2-3MB | ~2-3MB |
| 网络依赖 | 需要 | 不需要 |

---

## 🔗 相关链接

- **Live2D 官网**: https://www.live2d.com
- **pixi-live2d-display**: https://github.com/guansss/pixi-live2d-display
- **示例模型**: https://github.com/guansss/pixi-live2d-display/tree/master/test/models
- **VRoid Hub**: https://hub.vroid.com

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**: [LIVE2D_SETUP_GUIDE.md](./LIVE2D_SETUP_GUIDE.md)
2. **运行检查**: `./health-check.sh`
3. **查看控制台**: 浏览器 F12 → Console
4. **查看完整指南**: [AVATAR_GUIDE.md](./AVATAR_GUIDE.md)

---

**状态**: ✅ 配置完成，开箱即用  
**推荐**: 使用当前 CDN 配置，无需额外设置  
**最后更新**: 2025-10-11

