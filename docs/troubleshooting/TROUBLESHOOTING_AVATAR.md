# 🐛 Live2D 角色显示问题解决指南

## 问题：角色不显示

### 已完成的修复

✅ **修复时间**: 2025-10-11  
✅ **问题**: 页面显示但 Live2D 角色不显示  
✅ **原因**: 组件配置冲突，Canvas 未正确初始化  
✅ **解决方案**: 重构页面代码，直接使用 canvas 渲染

### 修改的文件

**文件**: `src/app/avatar-chat/page.tsx`

**主要更改**:
1. ✅ 移除了 `AvatarStage` 组件（有配置冲突）
2. ✅ 直接使用 `canvasRef` 渲染
3. ✅ 添加 `useEffect` 初始化 Avatar
4. ✅ 添加加载和错误状态显示

---

## 🧪 验证步骤

### 1. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
pnpm dev
```

### 2. 访问页面

打开浏览器访问: **http://localhost:3000/avatar-chat**

### 3. 打开浏览器控制台

按 `F12` 或 `Cmd+Option+I` 打开开发者工具

### 4. 查看控制台日志

你应该看到以下日志：

**正常加载**:
```
[AvatarChat] Initializing avatar...
[Live2D Manager] Loading model from: https://cdn.jsdelivr.net/gh/...
[Live2D Manager] Model loaded successfully
[AvatarChat] Avatar loaded!
```

**如果出现错误**:
```
[Live2D Manager] Failed to load model: [错误信息]
```

---

## 🔍 可能出现的问题

### 问题 1: 一直显示"加载中..."

**可能原因**:
1. 网络连接问题（无法访问 CDN）
2. CDN 链接失效
3. 浏览器阻止了跨域请求

**解决方案 A**: 检查网络
```bash
# 测试 CDN 是否可访问
curl -I https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json
```

**解决方案 B**: 下载本地模型
```bash
./download-live2d-model.sh
```

然后修改 `src/app/avatar-chat/page.tsx` 第 15 行：
```typescript
// 从 CDN
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",

// 改为本地
modelPath: "/models/live2d/hiyori/hiyori.model3.json",
```

### 问题 2: 显示错误信息

**错误**: "Failed to load model"

**解决方案**:
1. 查看浏览器控制台的详细错误
2. 确认 CDN 链接有效
3. 尝试切换到其他模型：

```typescript
// Shizuku 模型
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/shizuku/shizuku.model.json",

// Epsilon 模型
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/epsilon/epsilon2.1.model3.json",
```

### 问题 3: Canvas 是白色/空白

**可能原因**: Canvas 渲染失败

**解决方案**:
1. 检查浏览器是否支持 WebGL
   访问: https://get.webgl.org/

2. 尝试其他浏览器（Chrome 推荐）

3. 清除浏览器缓存后重试

### 问题 4: 角色显示但不动

**可能原因**: 动画未启用

**检查**:
```typescript
// 在浏览器控制台输入
avatar.state.isLoaded  // 应该返回 true
avatar.state.currentEmotion  // 应该显示当前情绪
```

**解决方案**: 点击"手动控制"按钮测试

---

## 🎯 快速诊断命令

在浏览器控制台运行：

```javascript
// 1. 检查 Avatar 状态
console.log(avatar.state);

// 2. 手动触发表情
avatar.setEmotion("happy");

// 3. 手动播放动作
avatar.playMotion("idle");

// 4. 检查模型路径
console.log(avatar.config.modelPath);
```

---

## 📋 检查清单

修复后，确认以下项目：

- [ ] 开发服务器正在运行 (`pnpm dev`)
- [ ] 访问 http://localhost:3000/avatar-chat
- [ ] 页面显示"Live2D Avatar"标题
- [ ] 看到加载动画（转圈）或角色
- [ ] 浏览器控制台无红色错误
- [ ] 角色会眨眼（等待几秒）
- [ ] 鼠标移动时角色眼睛会跟随
- [ ] 点击"手动控制"按钮有反应

---

## 🔧 完整重置流程

如果仍然无法显示，尝试完整重置：

```bash
# 1. 停止开发服务器
Ctrl + C

# 2. 清除 Next.js 缓存
rm -rf .next

# 3. 重新启动
pnpm dev

# 4. 硬刷新浏览器
Cmd+Shift+R (macOS) 或 Ctrl+Shift+R (Windows/Linux)
```

---

## 📊 预期效果

修复后，你应该看到：

### 加载阶段（1-3 秒）
```
┌────────────────────────┐
│  🧸 Live2D Avatar     │
├────────────────────────┤
│                        │
│    [转圈加载动画]      │
│                        │
│    加载中...           │
│    正在从 CDN 加载模型  │
│                        │
└────────────────────────┘
```

### 加载完成后
```
┌────────────────────────┐
│  🧸 Live2D Avatar     │
├────────────────────────┤
│                        │
│    [Live2D 角色]       │
│      👁️  👁️            │
│        👄             │
│                        │
│  （会眨眼、呼吸）       │
└────────────────────────┘
```

---

## 🌐 测试不同模型

如果当前模型有问题，尝试切换：

### 模型 1: Hiyori（当前）
```typescript
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
```

### 模型 2: Shizuku
```typescript
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/shizuku/shizuku.model.json",
scale: 0.2,  // Shizuku 需要稍大的缩放
```

### 模型 3: Epsilon
```typescript
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/epsilon/epsilon2.1.model3.json",
scale: 0.15,
```

---

## 📞 仍然无法解决？

### 步骤 1: 收集信息

在浏览器控制台运行：
```javascript
console.log("Browser:", navigator.userAgent);
console.log("WebGL:", !!document.createElement('canvas').getContext('webgl'));
console.log("Avatar State:", avatar?.state);
```

### 步骤 2: 查看完整日志

```bash
# 在终端查看服务器日志
pnpm dev
```

### 步骤 3: 查看文档

- **快速设置**: [LIVE2D_SETUP_GUIDE.md](./LIVE2D_SETUP_GUIDE.md)
- **详细指南**: [AVATAR_GUIDE.md](./AVATAR_GUIDE.md)
- **配置状态**: [LIVE2D_STATUS.md](./LIVE2D_STATUS.md)

---

## ✅ 修复确认

完成修复后，你应该能够：

1. ✅ 看到 Live2D 角色显示在页面左侧
2. ✅ 角色会自动眨眼（每隔几秒）
3. ✅ 鼠标移动时角色眼睛会跟随
4. ✅ 点击"手动控制"按钮可以切换表情
5. ✅ "当前状态"面板显示正确信息
6. ✅ 发送消息后角色表情会变化

---

**最后更新**: 2025-10-11  
**修复版本**: v0.1.1

