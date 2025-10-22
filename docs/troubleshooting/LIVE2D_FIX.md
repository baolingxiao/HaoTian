# 🔧 Live2D 显示问题修复记录

**修复时间**: 2025-10-11  
**问题**: Live2D Cubism SDK 加载失败

---

## 🐛 遇到的错误

```
Could not find Cubism 2 runtime. This plugin requires live2d.min.js to be loaded.
```

**原因**: 缺少 Live2D Cubism SDK 的 CDN 加载

---

## ✅ 已完成的修复

### 1. 添加 Live2D SDK CDN

**文件**: `src/app/layout.tsx`

**添加内容**:
```html
<script src="https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.min.js" async />
<script src="https://cdn.jsdelivr.net/npm/@cubism/live2d@2.1.0/dist/live2d.min.js" async />
```

### 2. 修复 Canvas 元素问题

**文件**: `src/app/avatar-chat/page.tsx`

**修改**: 将 `<div>` 改为 `<canvas>` 元素

### 3. 添加 SDK 加载等待逻辑

**文件**: `src/lib/avatar/live2d-manager.ts`

**添加**: 等待 Live2D SDK 完全加载后再初始化模型

---

## 🚀 现在需要做什么

### 步骤 1: 完全重启开发服务器

```bash
# 停止当前服务器
Ctrl + C

# 清除 Next.js 缓存
rm -rf .next

# 重新启动
pnpm dev
```

### 步骤 2: 硬刷新浏览器

访问: http://localhost:3000/avatar-chat

然后按:
- **macOS**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + F5`

### 步骤 3: 等待加载

1. 页面会显示"加载中..."
2. SDK 从 CDN 下载（首次需要 3-10 秒）
3. Live2D 模型加载
4. 角色显示！

---

## 🔍 验证步骤

### 检查 SDK 是否加载

打开浏览器控制台（F12），输入：

```javascript
window.Live2D
```

**应该返回**: 一个对象（不是 `undefined`）

### 检查 Avatar 状态

```javascript
console.log(avatar?.state)
```

**应该看到**:
```javascript
{
  isLoaded: true,
  isLoading: false,
  error: null,
  currentEmotion: "neutral",
  currentExpression: "default",
  isSpeaking: false
}
```

---

## 🐛 如果还是不行

### 问题 A: SDK 加载超时

**现象**: 一直显示"加载中..."

**解决方案**:
1. 检查网络连接
2. 尝试使用 VPN
3. 或下载本地模型（运行 `./download-live2d-model.sh`）

### 问题 B: 控制台显示其他错误

**解决方案**:
1. 截图错误信息
2. 查看 [TROUBLESHOOTING_AVATAR.md](./TROUBLESHOOTING_AVATAR.md)
3. 尝试切换到其他模型

### 问题 C: 模型加载但不显示

**解决方案**:
```bash
# 完全清理并重启
rm -rf .next
rm -rf node_modules/.cache
pnpm dev
```

---

## 📊 预期效果

修复后，你应该看到：

### 控制台日志（正常）
```
[AvatarChat] Initializing avatar...
[Live2DManager] Initializing...
[Live2DManager] PixiJS initialized
[Live2DManager] Loading model from: https://cdn.jsdelivr.net/...
[Live2DManager] Model loaded successfully
[Live2DManager] Starting auto-blink
[Live2DManager] Starting gaze tracking
[AvatarChat] Avatar loaded!
```

### 页面显示
```
┌────────────────────────────────────┐
│  🧸 Live2D Avatar                  │
├────────────────────────────────────┤
│                                    │
│      [Live2D 角色 Hiyori]          │
│         👁️  👁️                      │
│           👄                       │
│                                    │
│  • 会眨眼（每 3-5 秒）              │
│  • 眼睛跟随鼠标                     │
│  • 自然呼吸动画                     │
│                                    │
└────────────────────────────────────┘
```

---

## 🎯 快速重启命令

```bash
# 一键重启脚本
pkill -f "next dev" && rm -rf .next && pnpm dev
```

---

## 📝 修改文件清单

- [x] `src/app/layout.tsx` - 添加 SDK CDN
- [x] `src/app/avatar-chat/page.tsx` - 修复 Canvas
- [x] `src/lib/avatar/live2d-manager.ts` - 添加 SDK 等待逻辑
- [x] `src/app/layout.tsx` - 修复水合错误

---

## 🔗 相关文档

- [TROUBLESHOOTING_AVATAR.md](./TROUBLESHOOTING_AVATAR.md) - 故障排除
- [LIVE2D_SETUP_GUIDE.md](./LIVE2D_SETUP_GUIDE.md) - 设置指南
- [LIVE2D_STATUS.md](./LIVE2D_STATUS.md) - 当前状态

---

**最后更新**: 2025-10-11  
**状态**: ✅ 已修复，需要重启服务器

