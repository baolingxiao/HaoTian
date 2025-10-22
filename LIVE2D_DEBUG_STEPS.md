# 🔧 Live2D 调试步骤

**日期**: 2025-10-11  
**问题**: 即使无痕模式仍然报错 "Could not find Cubism 4 runtime"

---

## 📊 当前状态

### 已完成的修改

1. ✅ **修改了 SDK 加载方式**
   - 从 Next.js `<Script>` 改为原生 `<script>` 标签
   - 移除了 `defer` 属性，确保同步加载

2. ✅ **增强了诊断日志**
   - 添加了更多 console.log 输出
   - 显示 SDK 检测状态

3. ✅ **创建了诊断页面**
   - `http://localhost:3000/test-live2d`
   - 实时检测 SDK 加载状态

---

## 🎯 下一步操作

### 步骤 1: 访问诊断页面

1. **在无痕模式下打开**
   ```
   http://localhost:3000/test-live2d
   ```

2. **观察显示的状态**

#### 预期结果：

```
✓ window.Live2D: object 或 function (绿色)
✓ window.Live2DCubismCore: undefined (灰色)
```

#### 如果看到异常：

```
❌ window.Live2D: undefined (红色)
   → SDK 未加载，检查网络请求

⚠️ window.Live2DCubismCore: object (黄色)
   → 意外加载了 Cubism 4 SDK
```

### 步骤 2: 检查网络请求

1. **打开开发者工具** (`F12`)

2. **切换到 Network 标签**

3. **刷新页面**

4. **查找以下文件**:
   - `/live2d/live2d.min.js` - 应该是 **200 OK, 126KB**
   - 不应该有 `live2dcubismcore.min.js` 的请求

### 步骤 3: 查看控制台日志

应该看到以下日志顺序：

```javascript
[Live2D] Cubism 2.x SDK ready
[Live2D] window.Live2D exists: true
[Live2D] window.Live2DCubismCore exists: false  ← 重要！
[Live2D] PIXI registered to window
[Live2D] Loading pixi-live2d-display...
[Live2D] pixi-live2d-display loaded successfully
[Live2D] Live2DModel type: function
```

---

## 🔍 可能的问题和解决方案

### 问题 1: SDK 文件未加载

**症状**: 
```
window.Live2D: undefined
```

**原因**: 
- 文件路径错误
- 文件不存在
- Next.js 路由配置问题

**解决**:
```bash
# 检查文件是否存在
ls -lh /Users/dai/Desktop/AI_Chatpot/public/live2d/live2d.min.js

# 检查是否可访问
curl -I http://localhost:3000/live2d/live2d.min.js
```

### 问题 2: 意外加载了 Cubism 4

**症状**:
```
window.Live2DCubismCore: object
Could not find Cubism 4 runtime
```

**原因**:
- 可能存在 `live2dcubismcore.min.js` 文件
- 某处代码加载了 Cubism 4 SDK

**解决**:
```bash
# 检查是否有 Cubism 4 文件
find /Users/dai/Desktop/AI_Chatpot/public -name "*cubism*"

# 如果找到，删除它
rm /Users/dai/Desktop/AI_Chatpot/public/live2d/live2dcubismcore.min.js
```

### 问题 3: pixi-live2d-display 版本问题

**症状**:
- SDK 加载成功
- 但仍然报错找不到 Cubism 4

**原因**:
- `pixi-live2d-display@0.4.0` 内部逻辑问题
- 可能是包损坏

**解决**:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install

# 或者尝试不同版本
pnpm add pixi-live2d-display@0.4.0 --force
```

### 问题 4: 模型文件格式错误

**症状**:
- SDK 加载成功
- 但加载模型时报错

**原因**:
- 使用了 Cubism 4 模型 (`.model3.json`)
- 而不是 Cubism 2 模型 (`.model.json`)

**解决**:
```bash
# 检查模型文件格式
cat /Users/dai/Desktop/AI_Chatpot/public/models/22/model.2017.summer.super.1.json | head -5

# 应该看到:
# {
#   "type": "Live2D Model Setting",
#   "name": "...",
#   "model": "*.moc"  ← 不是 .moc3
# }
```

---

## 📋 完整诊断清单

### 1. 文件存在性检查

```bash
# SDK 文件
ls -lh public/live2d/live2d.min.js
# 应该显示: 126KB

# 模型文件
ls -lh public/models/22/model.2017.summer.super.1.json
# 应该显示: 1.0KB

ls -lh public/models/22/22.v2.moc
# 应该显示: 184KB
```

### 2. 网络可访问性检查

```bash
# SDK
curl -I http://localhost:3000/live2d/live2d.min.js
# 应该: HTTP/1.1 200 OK

# 模型
curl -I http://localhost:3000/models/22/model.2017.summer.super.1.json
# 应该: HTTP/1.1 200 OK
```

### 3. 代码检查

```typescript
// src/app/layout.tsx
// 应该有这行:
<script src="/live2d/live2d.min.js" defer={false}></script>

// src/app/avatar-chat/page.tsx
// 模型路径应该是:
modelPath: "/models/22/model.2017.summer.super.1.json"
```

### 4. 包版本检查

```json
// package.json
"pixi-live2d-display": "0.4.0",  // ← 必须是 0.4.0
"pixi.js": "6.5.10",              // ← 必须是 6.x
```

---

## 🆘 如果诊断页面显示正常，但 avatar-chat 仍然报错

这说明问题在于**时序**：诊断页面加载时 SDK 已准备好，但 avatar-chat 页面加载时 SDK 还没准备好。

### 解决方案: 增加延迟

修改 `src/app/avatar-chat/page.tsx`:

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const initAvatar = async () => {
    try {
      console.log("[AvatarChat] Waiting for SDK...");
      
      // 等待更长时间，确保 SDK 完全加载
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒
      
      console.log("[AvatarChat] Initializing avatar...");
      await avatar.init(canvas);
      console.log("[AvatarChat] Avatar loaded!");
    } catch (error: any) {
      console.error("[AvatarChat] Avatar error:", error);
    }
  };

  // 延迟初始化
  const timer = setTimeout(initAvatar, 500);
  return () => clearTimeout(timer);
}, [avatar]);
```

---

## 🎯 最终方案: 使用 CDN SDK

如果本地 SDK 始终有问题，可以尝试使用 CDN：

```typescript
// src/app/layout.tsx
<script 
  src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"
  defer={false}
></script>
```

**优点**:
- CDN 通常更稳定
- 避免本地路由问题

**缺点**:
- 需要网络连接
- 首次加载可能较慢

---

## 📊 诊断结果解读

### 情况 A: SDK 正常加载

```
✓ window.Live2D: object
✓ window.Live2DCubismCore: undefined
→ SDK 配置正确，问题可能在模型或时序
```

**下一步**: 
- 检查模型文件格式
- 增加初始化延迟

### 情况 B: SDK 未加载

```
✗ window.Live2D: undefined
✓ window.Live2DCubismCore: undefined
→ SDK 文件未加载
```

**下一步**:
- 检查文件路径
- 检查网络请求
- 尝试 CDN

### 情况 C: 错误的 SDK

```
✗ window.Live2D: undefined
⚠️ window.Live2DCubismCore: object
→ 加载了错误的 SDK 版本
```

**下一步**:
- 查找并删除 Cubism 4 文件
- 确保只有 live2d.min.js

---

## 🎉 成功标志

当一切正常时，你应该看到：

1. **诊断页面显示**:
   ```
   ✓ window.Live2D: object (绿色)
   ✓ window.Live2DCubismCore: undefined (灰色)
   ```

2. **控制台日志**:
   ```
   [Live2D] Cubism 2.x SDK ready
   [Live2D] window.Live2D exists: true
   [Live2D] window.Live2DCubismCore exists: false
   [AvatarChat] Avatar loaded!
   ```

3. **页面效果**:
   - ✅ 看到 Live2D 角色
   - ✅ 自动待机动画
   - ✅ 无错误信息

---

**下一步**: 请访问 `http://localhost:3000/test-live2d`（无痕模式），把页面截图发给我！



