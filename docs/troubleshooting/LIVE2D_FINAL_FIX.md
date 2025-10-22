# 🎭 Live2D 最终修复方案

**时间**: 2025-10-11  
**状态**: ✅ 已解决

---

## 🔍 问题根源

### 错误 1: `Could not find Cubism 2 runtime`
- **原因**: 缺少 Live2D Cubism Core SDK

### 错误 2: `Failed to load Live2D SDK from npm package`
- **原因**: `pixi-live2d-display-lipsyncpatch` 包在浏览器环境下有兼容性问题
- **原因**: PixiJS v7 与 `pixi-live2d-display` 不兼容（需要 v6）

---

## ✅ 最终解决方案

### 1. 使用官方稳定包

**移除**:
```bash
pixi-live2d-display-lipsyncpatch  # 不稳定
pixi.js@7.4.2                     # 版本不兼容
```

**安装**:
```bash
pnpm add pixi.js@6.5.10 pixi-live2d-display@0.4.0
```

### 2. 从 CDN 加载 Cubism Core

**添加到 `src/app/layout.tsx`**:
```typescript
<Script
  src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
  strategy="beforeInteractive"
/>
```

### 3. 更新导入语句

**修改 `src/lib/avatar/live2d-manager.ts`**:
```typescript
// 之前
import type { Live2DModel } from "pixi-live2d-display-lipsyncpatch";

// 现在
import type { Live2DModel } from "pixi-live2d-display";
```

---

## 📦 正确的依赖版本

```json
{
  "dependencies": {
    "pixi.js": "6.5.10",
    "pixi-live2d-display": "0.4.0"
  }
}
```

**重要**: 
- ✅ PixiJS 必须是 v6.x（不能用 v7 或 v8）
- ✅ `pixi-live2d-display` 使用官方稳定版 0.4.0
- ✅ Cubism Core 从官方 CDN 加载

---

## 🔧 修改的文件

### 1. `package.json`
```diff
dependencies:
- "pixi-live2d-display-lipsyncpatch": "0.5.0-ls-8"
- "pixi.js": "7.4.2"
+ "pixi.js": "6.5.10"
+ "pixi-live2d-display": "0.4.0"
```

### 2. `src/app/layout.tsx`
```diff
+ import Script from "next/script";

  <head>
-   {/* Live2D SDK 已包含在 npm 包中 */}
+   <Script
+     src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
+     strategy="beforeInteractive"
+   />
  </head>
```

### 3. `src/lib/avatar/live2d-manager.ts`
```diff
- import type { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
+ import type { Live2DModel } from "pixi-live2d-display";

async function loadLive2D() {
-   const module = await import("pixi-live2d-display-lipsyncpatch");
+   const module = await import("pixi-live2d-display");
    Live2DModelInstance = module.Live2DModel;
+   
+   // 注册 Cubism 版本支持
+   if ((window as any).PIXI) {
+     (window as any).PIXI.live2d = module;
+   }
}
```

---

## 🚀 部署步骤

### 完整修复流程

```bash
# 1. 停止服务器
lsof -ti:3000 | xargs kill -9

# 2. 移除旧包
pnpm remove pixi-live2d-display-lipsyncpatch pixi.js

# 3. 安装正确版本
pnpm add pixi.js@6.5.10 pixi-live2d-display@0.4.0

# 4. 清理缓存
rm -rf .next node_modules/.cache

# 5. 重新启动
pnpm dev
```

---

## ✅ 验证成功

### 浏览器控制台应该看到：

```
[Live2D] SDK loaded successfully from npm package
[AvatarChat] Initializing avatar...
[AvatarChat] Avatar loaded!
```

### 页面应该显示：

- ✅ Live2D 角色正常渲染
- ✅ 角色会眨眼
- ✅ 鼠标移动时角色会看向鼠标
- ✅ 没有 `Cubism` 或 `Live2D` 相关错误

---

## 🎯 为什么这个方案有效

### 1. 官方包更稳定
`pixi-live2d-display` 是官方维护的，经过充分测试

### 2. 版本兼容性
PixiJS v6 与 `pixi-live2d-display@0.4.0` 完全兼容

### 3. Cubism Core 从官方加载
官方 CDN 更可靠，支持所有 Cubism 版本（2.x 和 4.x）

### 4. Next.js Script 优化
`strategy="beforeInteractive"` 确保 Cubism Core 在页面加载前就绪

---

## 📊 技术架构

```
浏览器页面
    ↓
Next.js Layout (加载 Cubism Core CDN)
    ↓
AvatarChat 页面
    ↓
useAvatar Hook
    ↓
Live2DManager (动态导入 pixi-live2d-display)
    ↓
PixiJS v6 + Live2D Model
    ↓
Canvas 渲染
```

---

## 🔄 与之前方案的对比

| 方案 | 包 | PixiJS 版本 | Cubism Core | 状态 |
|------|-----|------------|------------|------|
| **方案 1** | pixi-live2d-display-lipsyncpatch | v7 | 无 | ❌ 失败 |
| **方案 2** | pixi-live2d-display-lipsyncpatch | v7 | CDN (错误版本) | ❌ 失败 |
| **方案 3** | pixi-live2d-display | v6 | 官方 CDN | ✅ **成功** |

---

## 💡 经验教训

### 1. 使用官方包
非官方的 fork 包（如 `-lipsyncpatch`）可能有兼容性问题

### 2. 注意版本兼容性
PixiJS v6 vs v7 是破坏性更新，必须匹配

### 3. Cubism Core 必须外部加载
虽然不方便，但官方 CDN 是最可靠的方案

### 4. 测试顺序
先确保基础功能（加载模型）工作，再添加高级功能（唇形同步）

---

## 🎉 最终状态

**现在访问**: http://localhost:3000

你将看到：
- ✅ 页面自动跳转到 Avatar 聊天
- ✅ Hiyori Live2D 角色完整显示
- ✅ 自动眨眼动画
- ✅ 鼠标追踪（角色看向鼠标）
- ✅ 表情切换功能
- ✅ 完全没有错误

---

## 📚 参考资料

- [pixi-live2d-display 官方文档](https://github.com/guansss/pixi-live2d-display)
- [PixiJS v6 文档](https://pixijs.io/guides/basics/getting-started.html)
- [Live2D Cubism SDK](https://www.live2d.com/en/download/cubism-sdk/)

---

**最后更新**: 2025-10-11  
**状态**: ✅ 完全修复，测试通过  
**维护者**: AI Assistant

