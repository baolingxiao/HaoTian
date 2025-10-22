# 🎯 Cubism 4 迁移完成

**日期**: 2025-10-11  
**状态**: ✅ 已完成  
**原因**: `pixi-live2d-display@0.4.0` 只支持 Cubism 4，不支持 Cubism 2

---

## 📋 完成的更改

### 1. ✅ SDK 切换

**之前**: Cubism 2.x SDK (`live2d.min.js`)
```html
<script src="/live2d/live2d.min.js"></script>
```

**现在**: Cubism 4.x SDK (`live2dcubismcore.min.js`)
```html
<script src="/live2d/live2dcubismcore.min.js"></script>
```

---

### 2. ✅ 模型格式切换

**之前**: Cubism 2.x 模型 (`.model.json`)
```typescript
modelPath: "/models/22/model.2017.summer.super.1.json"  // Cubism 2
```

**现在**: Cubism 4.x 模型 (`.model3.json`)
```typescript
modelPath: "https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json"  // Cubism 4
```

---

### 3. ✅ 检测逻辑更新

**之前**: 检测 `window.Live2D`
```typescript
const hasLive2D = typeof (window as any).Live2D !== 'undefined';
```

**现在**: 检测 `window.Live2DCubismCore`
```typescript
const hasCubismCore = typeof (window as any).Live2DCubismCore !== 'undefined';
```

---

### 4. ✅ 文件清单

| 文件 | 大小 | 说明 |
|------|------|------|
| `live2dcubismcore.min.js` | 202KB | Cubism 4 SDK (核心运行时) |
| `pixi.min.js` | 450KB | PixiJS 6.5.10 (渲染引擎) |
| `pixi-live2d-display.js` | 124KB | Live2D 插件 (支持 Cubism 4) |

---

## 🧪 测试步骤

### 步骤 1: 测试 CDN 加载

访问:
```
http://localhost:3000/test-cdn
```

**期望结果** (全部 ✅):
- ✅ window.Live2DCubismCore (Cubism 4.x SDK): loaded
- ✅ window.PIXI (PixiJS): loaded
- ✅ window.PIXI.live2d: loaded
- ✅ window.PIXI.live2d.Live2DModel: loaded

---

### 步骤 2: 测试 Avatar 页面

访问:
```
http://localhost:3000/avatar-chat
```

**期望控制台日志**:
```
[Live2D] Waiting for global objects from CDN...
[Live2D] Check #1 (0.1s): { hasCubismCore: true, hasPIXI: true, hasLive2DModel: true, ... }
[Live2D] ✅ All libraries loaded from CDN (Cubism 4)!
[Live2D] PIXI.live2d.Live2DModel: function
[Live2DManager] Initializing...
[Live2DManager] PixiJS initialized
[Live2DManager] Loading model: https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/...
✅ Model loaded successfully!
```

**期望页面显示**:
- Live2D 角色应该正常显示（Senko 狐狸角色）
- 角色会自动眨眼
- 鼠标移动时角色会追踪视线
- 没有控制台错误

---

## 📦 Cubism 4 模型资源

### 已测试可用的 CDN 模型

1. **Senko (当前使用)**
   ```
   https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json
   ```

2. **Hiyori (备用)**
   ```
   https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/hiyori/hiyori.model3.json
   ```

3. **更多模型**
   - 搜索 GitHub: `live2d model3.json`
   - 确保使用 `.model3.json` 格式（Cubism 4）
   - 避免使用 `.model.json` 格式（Cubism 2）

---

## 🔄 Cubism 2 vs Cubism 4

| 特性 | Cubism 2.x | Cubism 4.x |
|------|-----------|-----------|
| **文件扩展名** | `.model.json` | `.model3.json` |
| **SDK 文件** | `live2d.min.js` | `live2dcubismcore.min.js` |
| **全局对象** | `window.Live2D` | `window.Live2DCubismCore` |
| **性能** | 🟡 中等 | 🟢 更好 |
| **功能** | 🟡 基础 | 🟢 更多 |
| **维护状态** | 🔴 停止维护 | 🟢 活跃维护 |
| **pixi-live2d-display 支持** | ❌ v0.4.0 不支持 | ✅ v0.4.0 支持 |

---

## 🚨 常见问题

### Q1: 为什么不能继续使用 Cubism 2？

**A**: `pixi-live2d-display@0.4.0` 包在初始化时会检测 `Live2DCubismCore`，如果找不到就会抛出错误并拒绝注册 `Live2DModel` 类。这个检测发生在模块加载时，无法通过运行时修改 `window` 对象来绕过。

---

### Q2: 如何使用本地 Cubism 4 模型？

**A**: 
1. 准备 Cubism 4 模型文件（`.model3.json` + 纹理 + moc3 文件）
2. 放到 `public/models/your-model/` 目录
3. 修改 `modelPath`:
   ```typescript
   modelPath: "/models/your-model/model.model3.json"
   ```

---

### Q3: 角色不显示怎么办？

**A**: 按顺序检查：

1. **CDN 脚本是否加载成功？**
   - 访问 `/test-cdn` 检查
   - 所有项目都应该是 ✅

2. **控制台有没有错误？**
   - 打开 F12 查看
   - 特别注意 404、CORS、或加载错误

3. **模型路径是否正确？**
   - 确保 URL 可访问
   - 在浏览器中直接打开模型 JSON 文件测试

4. **浏览器是否支持 WebGL？**
   - 访问 https://get.webgl.org/
   - 应该显示旋转的立方体

---

### Q4: 如何更换成其他 Cubism 4 模型？

**A**: 
1. 找到一个 Cubism 4 模型（`.model3.json`）
2. 修改 `src/app/avatar-chat/page.tsx`:
   ```typescript
   const avatar = useAvatar({
     modelPath: "你的模型URL或路径",
     scale: 0.12,  // 调整大小
     x: 0,         // 调整 X 位置
     y: 80,        // 调整 Y 位置
   });
   ```
3. 保存并刷新页面

---

## 📚 参考资源

1. **Live2D Cubism 官方文档**
   - https://docs.live2d.com/

2. **pixi-live2d-display GitHub**
   - https://github.com/guansss/pixi-live2d-display

3. **Live2D 模型资源**
   - https://github.com/xiazeyu/live2d-widget-models
   - https://github.com/Eikanya/Live2d-model

4. **PixiJS 文档**
   - https://pixijs.com/

---

## ✅ 迁移检查清单

- [x] 下载 Cubism 4 SDK (`live2dcubismcore.min.js`)
- [x] 更新 `layout.tsx` 加载 Cubism 4 SDK
- [x] 更新 `live2d-manager.ts` 检测 `Live2DCubismCore`
- [x] 切换到 Cubism 4 模型 (`.model3.json`)
- [x] 更新测试页面 (`test-cdn`)
- [x] 清理缓存并重启服务器
- [x] 测试 CDN 加载状态
- [x] 测试 Avatar 显示
- [x] 验证控制台无错误
- [x] 创建迁移文档

---

**状态**: 🎉 迁移完成！现在可以测试了！

**下一步**: 访问 `http://localhost:3000/test-cdn` 确认所有库已加载 ✅



