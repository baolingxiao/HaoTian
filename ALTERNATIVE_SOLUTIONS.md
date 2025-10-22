# 🔄 Live2D 备用解决方案

**日期**: 2025-10-11  
**问题**: `pixi-live2d-display@0.4.0` 包内部检测逻辑有问题

---

## 🔍 问题分析

### 错误信息

```
Error: Could not find Cubism 4 runtime. This plugin requires live2dcubismcore.js to be loaded.
at eval (VM493 index.es.js:2173:9)
```

### 关键发现

1. ✅ **Cubism 2.x SDK 已正确加载** (`window.Live2D` exists)
2. ✅ **没有 Cubism 4 SDK** (`window.Live2DCubismCore` is undefined)
3. ❌ **`pixi-live2d-display` 包内部仍然报错找不到 Cubism 4**

### 根本原因

`pixi-live2d-display@0.4.0` 包的检测逻辑可能：
1. 在模块加载时（而非运行时）执行检测
2. 检测逻辑有 bug
3. Webpack 打包时改变了检测行为

---

## 💡 备用方案

### 方案 1: 使用 CDN 版本的 pixi-live2d-display ⭐⭐⭐⭐⭐

**原理**: 通过 `<script>` 标签直接加载，而非 npm import

**优点**:
- 绕过 Webpack 打包
- 避免 ES6 模块加载时的检测
- 通常更稳定

**实现步骤**:

1. **下载 pixi-live2d-display 的 UMD 版本**:
```bash
curl -o public/live2d/pixi-live2d-display.js https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js
```

2. **修改 `src/app/layout.tsx`**:
```typescript
<head>
  {/* 加载顺序很重要! */}
  <script src="/live2d/live2d.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js"></script>
  <script src="/live2d/pixi-live2d-display.js"></script>
</head>
```

3. **修改 `src/lib/avatar/live2d-manager.ts`**:
```typescript
async function loadLive2D() {
  if (typeof window === "undefined") return null;

  if (!Live2DModelInstance) {
    // 等待全局对象加载
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
      
      const check = () => {
        if (typeof (window as any).PIXI?.live2d?.Live2DModel !== 'undefined') {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });

    // 从全局对象获取
    Live2DModelInstance = (window as any).PIXI.live2d.Live2DModel;
  }

  return Live2DModelInstance;
}
```

---

### 方案 2: 使用 pixi-live2d-display 的 Cubism 4 版本 ⭐⭐⭐

**原理**: 既然它一直报错说找不到 Cubism 4，那就真的给它 Cubism 4

**优点**:
- 使用最新版本
- 更好的性能和功能
- 更多模型支持

**缺点**:
- 需要更换模型（Cubism 2 → Cubism 4）
- 需要更换 SDK

**实现步骤**:

1. **下载 Cubism 4 SDK**:
```bash
curl -o public/live2d/live2dcubismcore.min.js https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js
```

2. **使用 Cubism 4 模型**:
```typescript
modelPath: "/models/haru/haru.model3.json" // .model3.json 是 Cubism 4 格式
```

3. **升级 pixi-live2d-display**:
```bash
pnpm add pixi-live2d-display@latest
pnpm add pixi.js@7
```

---

### 方案 3: 使用其他 Live2D 库 ⭐⭐⭐⭐

**选项 A**: `live2d-widget`

- 更简单
- 专门为网页设计
- 但功能较少

```bash
pnpm add live2d-widget
```

**选项 B**: 直接使用 Live2D 官方 SDK

- 最原生
- 完全控制
- 但需要更多代码

---

### 方案 4: 修复包的源代码 ⭐⭐

**原理**: Fork `pixi-live2d-display` 并修复检测逻辑

**步骤**:

1. Fork 项目
2. 找到 `index.es.js:2173` 的检测代码
3. 修改检测逻辑
4. 发布到 npm 或使用本地路径

---

### 方案 5: 使用 Webpack 外部化 ⭐⭐⭐

**原理**: 告诉 Webpack 不要打包 `pixi-live2d-display`，从全局加载

**实现**:

修改 `next.config.mjs`:
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.externals = {
      ...config.externals,
      'pixi-live2d-display': 'PIXI.live2d',
      'pixi.js': 'PIXI',
    };
  }
  return config;
}
```

然后通过 CDN 加载这些库。

---

## 🎯 推荐方案

### 立即尝试: 方案 1 (CDN 版本)

**为什么推荐**:
1. 最简单
2. 最可靠
3. 不需要改太多代码
4. 绕过 Webpack/npm 的所有问题

**预计成功率**: 90%

### 如果方案 1 失败: 方案 2 (Cubism 4)

**为什么推荐**:
1. 使用更新的技术
2. 包本身就是为 Cubism 4 设计的
3. 更多模型可选

**预计成功率**: 95%

---

## 📋 方案 1 详细实施步骤

### 步骤 1: 下载 UMD 版本

```bash
cd /Users/dai/Desktop/AI_Chatpot/public/live2d

# 下载 pixi-live2d-display UMD 版本
curl -o pixi-live2d-display.js \
  https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js

# 下载 PixiJS UMD 版本
curl -o pixi.min.js \
  https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js
```

### 步骤 2: 修改 layout.tsx

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 加载顺序: Cubism SDK → PixiJS → pixi-live2d-display */}
        <script src="/live2d/live2d.min.js"></script>
        <script src="/live2d/pixi.min.js"></script>
        <script src="/live2d/pixi-live2d-display.js"></script>
      </head>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

### 步骤 3: 修改 live2d-manager.ts

```typescript
// src/lib/avatar/live2d-manager.ts
async function loadLive2D() {
  if (typeof window === "undefined") return null;

  if (!Live2DModelInstance) {
    try {
      console.log("[Live2D] Waiting for global objects...");
      
      // 等待所有全局对象加载
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for Live2D libraries"));
        }, 10000);
        
        const check = () => {
          const hasLive2D = typeof (window as any).Live2D !== 'undefined';
          const hasPIXI = typeof (window as any).PIXI !== 'undefined';
          const hasLive2DModel = typeof (window as any).PIXI?.live2d?.Live2DModel !== 'undefined';
          
          console.log("[Live2D] Check:", { hasLive2D, hasPIXI, hasLive2DModel });
          
          if (hasLive2D && hasPIXI && hasLive2DModel) {
            clearTimeout(timeout);
            console.log("[Live2D] All libraries loaded!");
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        
        check();
      });

      // 从全局对象获取 Live2DModel
      Live2DModelInstance = (window as any).PIXI.live2d.Live2DModel;
      
      console.log("[Live2D] Live2DModel obtained from global object");
    } catch (error) {
      console.error("[Live2D] Failed to load from global:", error);
      throw error;
    }
  }

  return Live2DModelInstance;
}
```

### 步骤 4: 测试

```bash
# 清除缓存
rm -rf .next
lsof -ti:3000 | xargs kill -9
pnpm dev

# 在浏览器中访问（无痕模式）
http://localhost:3000/avatar-chat
```

---

## 🔍 如何判断使用哪个方案

### 当前修改测试后

**如果还是报同样的错误** → 使用方案 1 (CDN)

**如果报不同的错误** → 根据新错误调整

**如果没有错误但没显示** → 检查模型加载

---

## 💻 快速切换命令

### 切换到 CDN 方案（方案 1）

```bash
# 下载文件
cd /Users/dai/Desktop/AI_Chatpot/public/live2d
curl -o pixi-live2d-display.js https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js
curl -o pixi.min.js https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js

# 然后手动修改 layout.tsx 和 live2d-manager.ts
```

### 切换到 Cubism 4（方案 2）

```bash
# 下载 Cubism 4 SDK
cd /Users/dai/Desktop/AI_Chatpot/public/live2d
curl -o live2dcubismcore.min.js https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js

# 升级包
pnpm add pixi-live2d-display@latest pixi.js@7

# 修改模型路径为 .model3.json
```

---

## 📊 方案对比

| 方案 | 复杂度 | 成功率 | 优点 | 缺点 |
|------|--------|--------|------|------|
| **方案 1 (CDN)** | ⭐⭐ | 90% | 最简单，最可靠 | 需要手动管理版本 |
| **方案 2 (Cubism 4)** | ⭐⭐⭐ | 95% | 最新技术，功能多 | 需要换模型 |
| **方案 3 (其他库)** | ⭐⭐⭐⭐ | 80% | 可能更简单 | 功能可能受限 |
| **方案 4 (修复源码)** | ⭐⭐⭐⭐⭐ | 100% | 完全控制 | 太复杂，维护困难 |
| **方案 5 (Webpack外部化)** | ⭐⭐⭐⭐ | 85% | 保持 npm 管理 | 配置复杂 |

---

**下一步**: 先刷新页面测试当前的修改。如果还是不行，我会立即实施方案 1（CDN）。



