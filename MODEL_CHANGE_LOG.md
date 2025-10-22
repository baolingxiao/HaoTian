# 🎭 Live2D 模型更换记录

**日期**: 2025-10-11  
**操作**: 更换 Live2D 角色模型

---

## 📊 更换详情

### 原模型

| 属性 | 值 |
|------|------|
| **名称** | Shizuku (雫) |
| **路径** | `/models/shizuku/shizuku.model.json` |
| **大小** | ~1.5MB |
| **版本** | Cubism 2.x |
| **来源** | Live2D 官方示例 |

### 新模型

| 属性 | 值 |
|------|------|
| **名称** | 模型 22 - 2017 夏日泳装版 (Super) |
| **路径** | `/models/22/model.2017.summer.super.1.json` |
| **大小** | ~4.5MB |
| **版本** | Cubism 2.x |
| **来源** | [imuncle/live2d](https://github.com/imuncle/live2d) |

---

## 🎨 模型特征

### 外观特点

- **服装**: 2017 夏日泳装（Super 版本）
- **纹理**: 4 张高质量纹理贴图
  - `texture_00.png` - 基础纹理
  - `texture_01.png` - 泳装纹理
  - `texture_02.png` - 附加纹理
  - `texture_03_1.png` - 特效纹理

### 动作支持

模型包含以下动作组：

1. **idle** (待机)
   - `22.v2.idle-01.mtn` - 待机动作 1
   - `22.v2.idle-02.mtn` - 待机动作 2
   - `22.v2.idle-03.mtn` - 待机动作 3

2. **tap_body** (点击身体)
   - `22.v2.touch.mtn` - 触摸反应

3. **thanking** (感谢)
   - `22.v2.thanking.mtn` - 感谢动作

### 布局配置

```json
{
  "center_x": 0,
  "center_y": 0.1,
  "width": 2.3,
  "height": 2.3
}
```

---

## 📁 文件结构

```
public/models/22/
├── 22.v2.moc                               # 模型主文件 (184KB)
├── model.2017.summer.super.1.json          # 当前使用的配置文件 ✅
├── model.*.json                            # 其他皮肤配置（共 20+ 个）
├── 22.1024/                                # 纹理目录
│   ├── closet.default.v2/
│   │   └── texture_00.png
│   └── closet.2017.summer.super/
│       ├── texture_01.png
│       ├── texture_02.png
│       └── texture_03_1.png
└── motions/                                # 动作文件目录
    ├── 22.v2.idle-01.mtn
    ├── 22.v2.idle-02.mtn
    ├── 22.v2.idle-03.mtn
    ├── 22.v2.touch.mtn
    └── 22.v2.thanking.mtn
```

---

## 🔧 代码修改

### 修改的文件

**`src/app/avatar-chat/page.tsx`**

```typescript
// 修改前
const avatar = useAvatar({
  modelPath: "/models/shizuku/shizuku.model.json",
  scale: 0.12,
  x: 0,
  y: 80,
});

// 修改后
const avatar = useAvatar({
  modelPath: "/models/22/model.2017.summer.super.1.json",
  scale: 0.15,  // 略微放大
  x: 0,
  y: 100,       // 略微下移
});
```

### 参数调整说明

- **scale**: `0.12` → `0.15` (放大 25%)
  - 原因: 模型 22 的默认尺寸较小，需要放大以更好展示
  
- **y**: `80` → `100` (下移 20px)
  - 原因: 调整垂直位置，确保完整显示

---

## 🎯 可用的其他皮肤

模型 22 包含 **20+ 种不同的皮肤配置**，可以通过修改 `modelPath` 切换：

### 节日主题

| 文件名 | 描述 |
|--------|------|
| `model.2016.xmas.1.json` | 2016 圣诞节版本 1 |
| `model.2016.xmas.2.json` | 2016 圣诞节版本 2 |
| `model.2017.newyear.json` | 2017 新年版本 |
| `model.2017.vdays.json` | 情人节版本 |

### 夏日系列

| 文件名 | 描述 |
|--------|------|
| `model.2017.summer.normal.1.json` | 夏日普通版 1 |
| `model.2017.summer.normal.2.json` | 夏日普通版 2 |
| `model.2017.summer.super.1.json` | ✅ 夏日 Super 版 1（当前） |
| `model.2017.summer.super.2.json` | 夏日 Super 版 2 |
| `model.2018.bls-summer.json` | 2018 夏日泳装 |

### 校园主题

| 文件名 | 描述 |
|--------|------|
| `model.2017.school.json` | 校园制服版 |
| `model.2017.tomo-bukatsu.high.json` | 社团活动高清版 |
| `model.2017.tomo-bukatsu.low.json` | 社团活动标准版 |

### 特殊版本

| 文件名 | 描述 |
|--------|------|
| `model.2017.cba-normal.json` | CBA 普通版 |
| `model.2017.cba-super.json` | CBA Super 版 |
| `model.2017.valley.json` | 山谷版本 |
| `model.2018.bls-winter.json` | 2018 冬季版 |
| `model.2018.lover.json` | 恋人版本 |
| `model.2018.spring.json` | 春季版本 |
| `model.default.json` | 默认版本 |

---

## 🔄 切换皮肤

### 方法 1: 修改代码

编辑 `src/app/avatar-chat/page.tsx`:

```typescript
const avatar = useAvatar({
  modelPath: "/models/22/model.2017.school.json", // 切换到校园版
  scale: 0.15,
  x: 0,
  y: 100,
});
```

### 方法 2: 实现皮肤选择器（未来功能）

可以在 UI 中添加下拉菜单，让用户动态切换皮肤：

```typescript
const [currentSkin, setCurrentSkin] = useState("model.2017.summer.super.1.json");

const avatar = useAvatar({
  modelPath: `/models/22/${currentSkin}`,
  scale: 0.15,
  x: 0,
  y: 100,
});
```

---

## 📊 性能对比

| 指标 | Shizuku | 模型 22 | 对比 |
|------|---------|---------|------|
| **总大小** | 1.5MB | 4.5MB | +3MB (⚠️ 更大) |
| **纹理数量** | 6 张 | 4 张 | -2 张 |
| **动作数量** | ~10 个 | 5 个 | -5 个 |
| **加载时间** | 4-6秒 | 6-10秒 | +2-4秒 (⚠️ 更慢) |
| **兼容性** | Cubism 2.x | Cubism 2.x | ✅ 相同 |

### 加载性能影响

由于模型 22 文件更大（4.5MB vs 1.5MB），首次加载时间会增加：

- **首次加载**: 预计 **6-10 秒**
- **第二次加载**: < 1 秒（浏览器缓存）

### 优化建议

如果觉得加载太慢，可以：

1. 使用 `model.default.json`（更小的默认版本）
2. 压缩纹理图片（参考 `PERFORMANCE_OPTIMIZATION.md`）
3. 使用 CDN 加速

---

## 🌐 模型来源

模型来自开源项目：[imuncle/live2d](https://github.com/imuncle/live2d)

### 关于该项目

- ⭐ **866 stars**
- 🍴 **198 forks**
- 📦 **128 个模型** (Cubism 2 + Cubism 3)
- 🎯 **用途**: 可直接用于静态网站

### 版权说明

根据原项目的版权须知：

> 所有模型均收集自互联网，版权均归原公司/个人所有。您可将资源用于学习、非营利性的网站或项目，不得用于商业使用（付费分发售卖资源、二次修改用于盈利等）。

✅ **我们的项目是非营利学习项目，符合使用条款。**

---

## ✅ 测试步骤

### 1. 清除浏览器缓存

为了确保加载新模型，请清除缓存：

- Chrome: `F12` → 右键刷新按钮 → "清空缓存并硬性重新加载"
- 或者: `Ctrl+Shift+Delete` → 清除缓存

### 2. 访问页面

```
http://localhost:3000/avatar-chat
```

### 3. 检查控制台

应该看到：
```
[AvatarChat] Initializing avatar...
[Live2D] Loading model: /models/22/model.2017.summer.super.1.json
[AvatarChat] Avatar loaded!
```

### 4. 观察效果

等待 6-10 秒后：
- ✅ 出现新的 Live2D 角色（泳装版）
- ✅ 角色会自动待机动作
- ✅ 点击角色会触发互动动作

---

## 🔧 故障排除

### 问题 1: 模型不显示

**可能原因**: 文件路径错误

**解决方案**:
```bash
# 检查文件是否存在
ls -lh /Users/dai/Desktop/AI_Chatpot/public/models/22/model.2017.summer.super.1.json
```

### 问题 2: 加载太慢

**可能原因**: 模型文件大（4.5MB）

**解决方案**:
1. 等待更长时间（6-10秒）
2. 使用更小的皮肤版本
3. 压缩纹理图片

### 问题 3: 404 错误

**可能原因**: Next.js 未识别新文件

**解决方案**:
```bash
# 重启开发服务器
lsof -ti:3000 | xargs kill -9
rm -rf .next
pnpm dev
```

---

## 📚 相关文档

- **性能优化**: `PERFORMANCE_OPTIMIZATION.md`
- **错误诊断**: `LIVE2D_ERROR_DIAGNOSIS.md`
- **根本原因分析**: `LIVE2D_ROOT_CAUSE_ANALYSIS.md`
- **用户手册**: `USER_MANUAL.md`

---

## 🎉 总结

### 完成的工作

1. ✅ 从 [imuncle/live2d](https://github.com/imuncle/live2d) 仓库克隆模型
2. ✅ 复制模型 22 到项目 `public/models/22/`
3. ✅ 更新 `avatar-chat/page.tsx` 使用新模型
4. ✅ 调整缩放和位置参数

### 更换后的好处

1. 🎨 **更多皮肤选择** - 20+ 种不同风格
2. 🎭 **丰富的主题** - 节日、校园、夏日等
3. 🔄 **灵活切换** - 可轻松更换皮肤

### 注意事项

1. ⚠️ **文件更大** - 加载时间增加 2-4 秒
2. ⚠️ **需要清除缓存** - 首次使用需清除浏览器缓存
3. ✅ **完全兼容** - 仍使用 Cubism 2.x，无需修改代码

---

**最后更新**: 2025-10-11  
**状态**: ✅ 已完成并可使用



