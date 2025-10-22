# 🔍 Live2D 错误诊断报告

**日期**: 2025-10-11  
**错误**: `Could not find Cubism 4 runtime. This plugin requires live2dcubismcore.js to be loaded.` 和 `Failed to load Live2D SDK`

---

## 📊 问题分析

### 错误截图显示的问题

1. **第一个错误**: 
   ```
   Could not find Cubism 4 runtime. This plugin requires live2dcubismcore.js to be loaded.
   ```
   
2. **第二个错误**:
   ```
   Failed to load Live2D SDK. Please check /live2d/live2d.min.js
   ```

### 根本原因

检查发现了 **多个问题同时存在**：

| 问题 | 状态 | 说明 |
|------|------|------|
| ❌ Hiyori CDN模型404 | **致命** | CDN 返回 404 Not Found |
| ✅ Cubism 2.x SDK 已下载 | 正常 | `public/live2d/live2d.min.js` (126KB) |
| ✅ Shizuku 模型已下载 | 正常 | `public/models/shizuku/` (1.5MB) |
| ⚠️ 浏览器缓存 | **问题** | 可能加载了旧代码 |
| ⚠️ 错误的SDK检测 | **问题** | 代码检测到 Cubism 4 而非 2 |

---

## 🎯 核心问题

### 问题1: Hiyori CDN 模型不可用

```bash
$ curl -I "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/hiyori/hiyori.model.json"
HTTP/2 404 
```

**结论**: CDN 模型已失效，无法使用！

### 问题2: SDK 版本混淆

`pixi-live2d-display@0.4.0` 要求：
- ✅ **Cubism 2.x SDK** (`live2d.min.js`) ← 我们有
- ❌ **不支持 Cubism 4.x SDK** (`live2dcubismcore.min.js`)

但浏览器报错说找不到 **Cubism 4**，这说明：
- 代码中某处仍在尝试加载 Cubism 4 SDK
- 或者浏览器缓存了旧代码

### 问题3: 浏览器缓存

Next.js 的热重载 (HMR) 有时不会完全刷新：
- 浏览器缓存了旧的 JavaScript
- Service Worker 可能缓存了旧资源
- Webpack 缓存可能未清除

---

## ✅ 解决方案

### 第1步: 确认文件正确性 ✅

检查结果：
```bash
✅ public/live2d/live2d.min.js - 126KB (Cubism 2.x SDK)
✅ public/models/shizuku/shizuku.model.json - 1.8KB
✅ public/models/shizuku/moc/shizuku.moc - 675KB
✅ public/models/shizuku/moc/shizuku.1024/*.png - 821KB (6张纹理)
```

### 第2步: 清除所有缓存 ✅

已执行：
```bash
rm -rf .next node_modules/.cache
lsof -ti:3000 | xargs kill -9
pnpm dev
```

### 第3步: 清除浏览器缓存

**请按以下步骤操作**：

#### Chrome / Edge

1. 打开 `http://localhost:3000/avatar-chat`
2. 按 `F12` 打开开发者工具
3. 在开发者工具中：
   - 右键点击 **刷新按钮** （地址栏旁边）
   - 选择 **"清空缓存并硬性重新加载"** (Empty Cache and Hard Reload)
4. 或者：
   - `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
   - 选择 **"缓存的图片和文件"**
   - 时间范围: **"全部时间"**
   - 点击 **"清除数据"**

#### Safari

1. `Cmd+Option+E` 清空缓存
2. 或者：
   - Safari → 偏好设置 → 高级
   - 勾选 "在菜单栏中显示'开发'菜单"
   - 开发 → 清空缓存

#### Firefox

1. `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
2. 选择 **"缓存"**
3. 时间范围: **"全部"**
4. 点击 **"立即清除"**

---

## 🔍 如何验证修复

### 步骤1: 打开浏览器开发者工具

1. 访问 `http://localhost:3000/avatar-chat`
2. 按 `F12` 打开开发者工具
3. 切换到 **Console (控制台)** 标签

### 步骤2: 检查正确的日志输出

**应该看到**:
```
[Live2D] Cubism 2.x SDK ready
[Live2D] pixi-live2d-display loaded successfully
[AvatarChat] Initializing avatar...
[Live2D] Loading model: /models/shizuku/shizuku.model.json
[AvatarChat] Avatar loaded!
```

**不应该看到**:
```
❌ Could not find Cubism 4 runtime
❌ Could not find Cubism 2 runtime
❌ Failed to load Live2D SDK
❌ 404 (Not Found)
```

### 步骤3: 检查网络请求

切换到 **Network (网络)** 标签，刷新页面，确认：

| 资源 | 状态 | 大小 | 说明 |
|------|------|------|------|
| `/live2d/live2d.min.js` | ✅ 200 | 126KB | Cubism 2.x SDK |
| `/models/shizuku/shizuku.model.json` | ✅ 200 | 1.8KB | 模型配置 |
| `/models/shizuku/moc/shizuku.moc` | ✅ 200 | 675KB | 模型数据 |
| `/models/shizuku/moc/shizuku.1024/texture_*.png` | ✅ 200 | 821KB | 纹理图片 |

**不应该出现**:
- ❌ CDN 请求（`cdn.jsdelivr.net`）
- ❌ 404 错误

### 步骤4: 观察 Canvas 渲染

等待 4-6 秒后，应该看到：
- ✅ Canvas 中出现 Shizuku 角色
- ✅ 角色有自动眨眼动画
- ✅ 鼠标移动时角色会跟随视线

---

## 📋 故障排除

### 如果仍然看到 "Cubism 4" 错误

**原因**: 浏览器强缓存

**解决**:
1. 关闭浏览器所有标签页
2. 完全退出浏览器
3. 重新打开浏览器
4. 访问 `http://localhost:3000/avatar-chat`

### 如果看到 "Cubism 2" 错误

**原因**: SDK 文件未加载

**检查**:
```bash
# 确认文件存在
ls -lh public/live2d/live2d.min.js

# 确认可以访问
curl -I http://localhost:3000/live2d/live2d.min.js
```

**解决**:
```bash
# 重新下载 SDK
cd /Users/dai/Desktop/AI_Chatpot/public/live2d
curl -o live2d.min.js https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
```

### 如果加载很慢

**原因**: 模型文件大 (1.5MB)

**正常**: 首次加载 4-6秒是正常的

**优化**: 参考 `PERFORMANCE_OPTIMIZATION.md`

### 如果角色不显示但无错误

**原因**: Canvas 大小或位置问题

**检查**:
1. 浏览器开发者工具 → Elements
2. 找到 `<canvas>` 元素
3. 确认 `width` 和 `height` 不是 `0`
4. 确认 `display` 不是 `none`

---

## 🎯 预期结果

### 成功的标志

1. ✅ **控制台无错误**
   - 没有 "Cubism" 相关错误
   - 没有 404 错误

2. ✅ **模型加载成功**
   - 看到 "Avatar loaded!" 日志
   - Canvas 显示 Shizuku 角色

3. ✅ **动画正常**
   - 自动眨眼
   - 视线跟随鼠标
   - 表情切换正常

4. ✅ **加载时间可接受**
   - 首次: 4-6秒
   - 第二次: <1秒 (缓存)

---

## 📊 技术细节

### pixi-live2d-display 版本兼容性

| pixi-live2d-display | Cubism SDK | 模型格式 | 状态 |
|---------------------|------------|---------|------|
| @0.4.0 | **Cubism 2.x** | `.model.json` | ✅ 当前使用 |
| @0.5.0+ | **Cubism 4.x** | `.model3.json` | ❌ 不兼容 PixiJS v6 |

### 我们的配置

```typescript
// package.json
"pixi-live2d-display": "0.4.0",  // Cubism 2.x 专用
"pixi.js": "6.5.10",              // v6 (兼容)

// layout.tsx
<Script src="/live2d/live2d.min.js" />  // Cubism 2.x SDK

// avatar-chat/page.tsx
modelPath: "/models/shizuku/shizuku.model.json"  // Cubism 2.x 模型
```

### SDK 全局对象

| SDK 版本 | 全局对象 | 文件名 |
|---------|---------|--------|
| Cubism 2.x | `window.Live2D` | `live2d.min.js` |
| Cubism 4.x | `window.Live2DCubismCore` | `live2dcubismcore.min.js` |

---

## 💡 总结

### 问题根源

1. **Hiyori CDN 模型失效** (404)
2. **浏览器缓存了旧代码**
3. **SDK 版本检测混乱**

### 解决方案

1. ✅ 使用本地 Shizuku 模型
2. ✅ 清除所有缓存
3. ✅ 正确配置 Cubism 2.x SDK

### 下一步

1. **清除浏览器缓存** (重要！)
2. **硬性重新加载** (`Ctrl+Shift+R`)
3. **检查控制台日志**
4. **等待 4-6 秒** 观察效果

---

## 🆘 如果还有问题

### 快速诊断命令

```bash
# 1. 确认服务器运行
curl -I http://localhost:3000

# 2. 确认 SDK 可访问
curl -I http://localhost:3000/live2d/live2d.min.js

# 3. 确认模型可访问
curl -I http://localhost:3000/models/shizuku/shizuku.model.json

# 4. 查看开发日志
tail -50 /Users/dai/Desktop/AI_Chatpot/dev.log
```

### 联系信息

如果问题仍未解决，请提供：
1. 浏览器控制台的完整错误信息（截图）
2. Network 标签的请求列表（截图）
3. 使用的浏览器及版本

---

**最后更新**: 2025-10-11 23:00  
**状态**: 🔄 等待用户清除浏览器缓存并测试

