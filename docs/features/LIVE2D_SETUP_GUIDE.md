# 🎭 Live2D 角色快速设置指南

**5 分钟完成 Live2D 角色配置！**

---

## 🚀 最快方式：使用 CDN（推荐）

### 优点
- ✅ **无需下载**：直接使用在线模型
- ✅ **立即可用**：修改一行代码即可
- ✅ **零配置**：不需要管理文件

### 步骤

1. **打开配置文件**：
   ```bash
   open src/app/avatar-chat/page.tsx
   # 或使用任何代码编辑器
   ```

2. **修改第 13 行**（modelPath）:
   
   **修改前**：
   ```typescript
   modelPath: "/models/live2d/hiyori/hiyori.model3.json",
   ```
   
   **修改后**（使用 CDN）：
   ```typescript
   modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
   ```

3. **启动应用**：
   ```bash
   pnpm dev
   ```

4. **访问页面**：
   打开浏览器访问 http://localhost:3000/avatar-chat

**就这么简单！✨**

---

## 📥 方式 2：下载本地模型

### 为什么选择本地模型？
- 离线使用
- 更快的加载速度（首次加载后）
- 可以使用自定义模型

### 步骤 1：下载官方示例模型

**Hiyori 模型（推荐）**:

```bash
# 方式 A: 使用 Git（如果已安装）
cd /Users/dai/Desktop/AI_Chatpot
git clone --depth 1 https://github.com/guansss/pixi-live2d-display.git temp
cp -r temp/test/models/hiyori public/models/live2d/
rm -rf temp

# 方式 B: 手动下载
# 1. 访问: https://github.com/guansss/pixi-live2d-display/tree/master/test/models/hiyori
# 2. 下载所有文件到: public/models/live2d/hiyori/
```

### 步骤 2：验证文件结构

确保目录结构如下：
```
public/models/live2d/hiyori/
├── hiyori.model3.json      ← 主配置文件
├── hiyori.moc3             ← 模型数据
├── hiyori.2048/            ← 纹理文件夹
│   ├── texture_00.png
│   ├── texture_01.png
│   └── ...
├── motions/                ← 动作文件夹
│   ├── Idle/
│   ├── TapBody/
│   └── ...
└── expressions/            ← 表情文件夹（可选）
```

### 步骤 3：配置路径

在 `src/app/avatar-chat/page.tsx` 中：

```typescript
modelPath: "/models/live2d/hiyori/hiyori.model3.json",
```

### 步骤 4：启动应用

```bash
pnpm dev
```

访问: http://localhost:3000/avatar-chat

---

## 🎨 方式 3：使用其他模型

### 免费 Live2D 模型资源

| 模型名称 | CDN 链接 | 说明 |
|---------|---------|------|
| **Hiyori** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json` | 官方示例，女性角色 |
| **Shizuku** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/shizuku/shizuku.model.json` | 官方示例，可爱风格 |
| **Epsilon** | `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/epsilon/epsilon2.1.model3.json` | 官方示例，科技风 |

### 使用方法

直接替换 `modelPath` 为上述任意 CDN 链接即可！

---

## 🔧 自定义配置

### 调整角色大小和位置

在 `src/app/avatar-chat/page.tsx` 中：

```typescript
const avatar = useAvatar({
  modelPath: "...",        // 模型路径
  scale: 0.15,             // 缩放（0.1-0.3 推荐）
  x: 0,                    // X 轴偏移（-200 到 200）
  y: 100,                  // Y 轴偏移（0 到 200）
});
```

**调整建议**：
- `scale`: 
  - `0.1` = 很小
  - `0.15` = 中等（推荐）
  - `0.2` = 较大
  - `0.3` = 很大

- `y`:
  - `0` = 角色在顶部
  - `100` = 居中（推荐）
  - `200` = 角色在底部

### 情绪和表情映射

项目已内置情绪检测，自动根据对话内容切换表情：

- **happy** 😊: 积极、开心的内容
- **sad** 😢: 消极、难过的内容
- **angry** 😠: 生气、愤怒的内容
- **surprised** 😲: 惊讶的内容
- **neutral** 😐: 默认表情

**自动触发**，无需手动配置！

---

## 📊 当前项目状态

运行设置脚本查看：
```bash
./setup-avatar.sh
```

或手动检查：
```bash
# 检查目录
ls -la public/models/live2d/

# 检查模型文件
find public/models/live2d -name "*.model3.json"
```

---

## 🐛 故障排除

### 问题 1: 角色不显示

**检查项**：
1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 确认模型路径正确
4. 如果使用本地模型，确认文件已下载

**解决方案**：
```typescript
// 方案 A: 使用 CDN（最可靠）
modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",

// 方案 B: 检查本地路径
// 确保文件存在: public/models/live2d/hiyori/hiyori.model3.json
modelPath: "/models/live2d/hiyori/hiyori.model3.json",
```

### 问题 2: 模型加载很慢

**原因**: 
- 网络连接慢（CDN）
- 模型文件太大（本地）

**解决方案**:
- CDN 方式: 等待初次加载，之后会缓存
- 本地方式: 下载模型到本地使用

### 问题 3: 模型显示不完整

**原因**: 缩放或位置不对

**解决方案**:
```typescript
// 调整这些参数
scale: 0.15,  // 增大或减小
y: 100,       // 调整垂直位置
```

### 问题 4: 表情不切换

**检查项**:
1. 模型是否支持表情（需要 `expressions/` 文件夹）
2. 查看控制台是否有情绪检测日志

**调试**:
```typescript
// 手动触发表情
avatar.setEmotion("happy");
avatar.setExpression("smile");
```

---

## 📖 完整示例

### 最小可运行示例（CDN）

```typescript
"use client";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarStage from "@/components/avatar/AvatarStage";

export default function Page() {
  const avatar = useAvatar({
    modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
    scale: 0.15,
    x: 0,
    y: 100,
  });

  return (
    <div className="h-screen">
      <AvatarStage
        width={400}
        height={600}
        avatar={avatar}
        onLoad={() => console.log("加载成功！")}
        onError={(e) => console.error("加载失败：", e)}
      />
      <button onClick={() => avatar.setEmotion("happy")}>
        让角色开心
      </button>
    </div>
  );
}
```

---

## 🎯 推荐配置（开箱即用）

### 配置 1：使用 CDN Hiyori（最简单）

```typescript
const avatar = useAvatar({
  modelPath: "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json",
  scale: 0.15,
  x: 0,
  y: 100,
});
```

**特点**: 无需任何准备，直接运行！

### 配置 2：本地 Hiyori（更快）

下载模型后：
```typescript
const avatar = useAvatar({
  modelPath: "/models/live2d/hiyori/hiyori.model3.json",
  scale: 0.15,
  x: 0,
  y: 100,
});
```

**特点**: 首次下载后，加载速度更快。

---

## 🔗 相关资源

| 资源 | 链接 | 说明 |
|------|------|------|
| **完整指南** | [AVATAR_GUIDE.md](./AVATAR_GUIDE.md) | 详细的 Avatar 系统文档 |
| **示例页面** | http://localhost:3000/avatar-chat | Live2D + 聊天演示 |
| **用户手册** | [USER_MANUAL.md](./USER_MANUAL.md) | 完整使用手册 |
| **GitHub** | https://github.com/guansss/pixi-live2d-display | Live2D 库文档 |

---

## 📝 快速命令

```bash
# 1. 创建目录结构
./setup-avatar.sh

# 2. 下载示例模型（可选）
git clone --depth 1 https://github.com/guansss/pixi-live2d-display.git temp
cp -r temp/test/models/hiyori public/models/live2d/
rm -rf temp

# 3. 启动应用
pnpm dev

# 4. 访问页面
open http://localhost:3000/avatar-chat
```

---

## ✅ 验证清单

设置完成后，检查以下项目：

- [ ] `public/models/` 目录已创建
- [ ] `src/app/avatar-chat/page.tsx` 中的 `modelPath` 已配置
- [ ] 运行 `pnpm dev` 无错误
- [ ] 访问 http://localhost:3000/avatar-chat 能看到角色
- [ ] 角色会眨眼、呼吸
- [ ] 鼠标移动时角色眼睛会跟随
- [ ] 发送消息后角色表情会变化

---

## 🎉 完成！

设置完成后，你的 AI Chatpot 就有了一个可爱的 Live2D 角色了！

**推荐**: 先使用 CDN 方式测试，确认功能正常后再考虑下载本地模型。

**需要帮助？** 查看 [AVATAR_GUIDE.md](./AVATAR_GUIDE.md) 或运行 `./health-check.sh`

---

**最后更新**: 2025-10-11  
**快速入门时间**: ⏱️ 5 分钟

