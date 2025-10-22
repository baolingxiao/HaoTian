# 🎭 Live2D Avatar 系统使用指南

## 📋 目录
1. [获取 Live2D 模型](#获取-live2d-模型)
2. [模型文件结构](#模型文件结构)
3. [配置 Avatar](#配置-avatar)
4. [使用示例](#使用示例)
5. [表情和动作映射](#表情和动作映射)
6. [常见问题](#常见问题)

---

## 获取 Live2D 模型

### 免费 Live2D 模型资源

#### 1. **Live2D 官方示例模型** ⭐ 推荐

Live2D 官方提供了一些免费的示例模型用于学习和测试：

**Hiyori 模型（官方示例）**:
```bash
# 1. 下载官方示例
https://github.com/guansss/pixi-live2d-display/tree/master/test/models

# 2. 或使用 CDN
https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/models/hiyori/hiyori.model3.json
```

**安装步骤**:
```bash
# 在项目根目录
mkdir -p public/models/live2d/hiyori

# 下载模型文件到这个目录
# 需要包含：
# - hiyori.model3.json
# - *.moc3
# - *.png (纹理文件)
# - motions/ (动作文件夹)
# - expressions/ (表情文件夹)
```

#### 2. **其他免费资源**

| 来源 | 链接 | 特点 |
|------|------|------|
| nizhuancn | https://www.nizhuancn.com/topics/21 | 中文社区，多种模型 |
| Live2D Viewer | https://github.com/guansss/pixi-live2d-display | 官方测试模型 |
| Booth.pm | https://booth.pm | 日本商店，部分免费 |
| VRoid Hub | https://hub.vroid.com | 主要是 VRM，可转换 |

#### 3. **商业模型**

如需商业使用，请购买正版授权：
- **Live2D 官方商城**: https://www.live2d.com/download/cubism/
- **Booth.pm**: https://booth.pm
- **淘宝/Gumroad**: 搜索 "Live2D 模型"

---

## 模型文件结构

### 标准 Live2D Cubism 3.x 模型结构

```
public/models/live2d/your-model/
├── model.model3.json       # 主配置文件（必需）
├── model.moc3              # 模型数据（必需）
├── textures/               # 纹理文件夹
│   ├── texture_00.png
│   └── texture_01.png
├── motions/                # 动作文件夹
│   ├── idle_01.motion3.json
│   ├── happy_01.motion3.json
│   └── ...
├── expressions/            # 表情文件夹
│   ├── default.exp3.json
│   ├── smile.exp3.json
│   ├── sad.exp3.json
│   └── ...
└── physics.physics3.json   # 物理效果（可选）
```

### 最小化模型（仅展示）

如果只需要基本展示，最少需要：
```
your-model/
├── model.model3.json
├── model.moc3
└── texture_00.png
```

---

## 配置 Avatar

### 基础配置

```typescript
import AvatarStage from "@/components/avatar/AvatarStage";

<AvatarStage
  config={{
    modelPath: "/models/live2d/hiyori/hiyori.model3.json",
    scale: 0.15,          // 缩放比例
    x: 0,                 // X 偏移
    y: 100,               // Y 偏移
    autoBlinkEnabled: true,
    mouseLookEnabled: true,
  }}
  width="100%"
  height="600px"
/>
```

### 完整配置选项

```typescript
interface AvatarConfig {
  // 模型路径（必需）
  modelPath: string;
  
  // 显示配置
  scale?: number;              // 缩放 (0.1 - 1.0)
  x?: number;                  // X 偏移 (-500 - 500)
  y?: number;                  // Y 偏移 (-500 - 500)
  
  // 行为配置
  autoBlinkEnabled?: boolean;  // 自动眨眼
  autoBreathEnabled?: boolean; // 自动呼吸
  mouseLookEnabled?: boolean;  // 鼠标追踪
  idleMotionEnabled?: boolean; // 待机动画
  
  // 表情配置
  defaultExpression?: Expression;
  transitionDuration?: number; // 过渡时长 (ms)
}
```

---

## 使用示例

### 1. 基础集成

```typescript
"use client";

import AvatarStage from "@/components/avatar/AvatarStage";

export default function MyPage() {
  return (
    <div>
      <h1>My Avatar</h1>
      <AvatarStage
        config={{ modelPath: "/models/live2d/hiyori/hiyori.model3.json" }}
        width="400px"
        height="600px"
      />
    </div>
  );
}
```

### 2. 编程控制 Avatar

```typescript
"use client";

import { useAvatar } from "@/hooks/useAvatar";
import { useRef, useEffect } from "react";

export default function ControlledAvatar() {
  const avatar = useAvatar();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      avatar.init(canvasRef.current);
    }
  }, [avatar]);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      
      <div>
        <button onClick={() => avatar.setEmotion("happy")}>
          开心
        </button>
        <button onClick={() => avatar.setEmotion("sad")}>
          悲伤
        </button>
        <button onClick={() => avatar.speak(true)}>
          开始说话
        </button>
        <button onClick={() => avatar.speak(false)}>
          停止说话
        </button>
      </div>
    </div>
  );
}
```

### 3. 与聊天集成（自动情绪识别）

```typescript
"use client";

import { useAvatar } from "@/hooks/useAvatar";
import AvatarStage from "@/components/avatar/AvatarStage";

export default function ChatWithAvatar() {
  const avatar = useAvatar();
  const [messages, setMessages] = useState([]);

  const handleAIResponse = async (userMessage: string) => {
    // 发送到 LLM
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: userMessage }),
    });

    const aiReply = await response.json();

    // 自动分析情绪
    avatar.analyzeText(aiReply.text);
    
    // 播放说话动画
    avatar.speak(true);
    setTimeout(() => avatar.speak(false), 3000);

    setMessages([...messages, { role: "ai", content: aiReply.text }]);
  };

  return (
    <div className="flex">
      <AvatarStage config={{ modelPath: "/models/live2d/hiyori/hiyori.model3.json" }} />
      {/* Chat UI */}
    </div>
  );
}
```

### 4. 使用情绪标签

在 LLM 的 System Prompt 中添加：
```
当你感到开心时，在回复中添加 [emotion:happy]
当你感到惊讶时，在回复中添加 [emotion:surprised]
```

Avatar 会自动检测并应用这些标签，然后移除它们。

---

## 表情和动作映射

### 内置情绪类型

```typescript
type Emotion = 
  | "neutral"    // 中性
  | "happy"      // 开心
  | "sad"        // 悲伤
  | "angry"      // 生气
  | "surprised"  // 惊讶
  | "confused"   // 困惑
  | "excited"    // 兴奋
  | "thinking";  // 思考
```

### 情绪到表情的映射

```typescript
const EMOTION_TO_EXPRESSION = {
  neutral: "default",
  happy: "smile",
  sad: "sad",
  angry: "angry",
  surprised: "surprised",
  confused: "embarrassed",
  excited: "smile",
  thinking: "default",
};
```

### 自定义表情映射

```typescript
// src/lib/avatar/emotion.ts

// 修改映射规则
export const EMOTION_TO_EXPRESSION: Record<Emotion, Expression> = {
  neutral: "default",
  happy: "smile",
  sad: "sad",
  angry: "angry",
  surprised: "surprised",
  confused: "your_custom_expression",  // 使用模型中的实际表情名
  excited: "wink",
  thinking: "default",
};
```

### 触发关键词

```typescript
const EMOTION_KEYWORDS = {
  happy: ["开心", "高兴", "快乐", "哈哈", "😊", "太好了"],
  sad: ["难过", "伤心", "悲伤", "😢", "遗憾", "失望"],
  angry: ["生气", "愤怒", "😠", "讨厌", "烦"],
  surprised: ["惊讶", "震惊", "😮", "哇", "天哪", "不会吧"],
  // ...
};
```

你可以在 `src/lib/avatar/emotion.ts` 中自定义关键词。

---

## 常见问题

### 1. 模型加载失败：404 错误

**问题**: `Failed to load model: 404 Not Found`

**解决方案**:
1. 检查模型文件是否在 `public/models/live2d/` 目录
2. 确认路径正确，注意大小写
3. 检查 `model.json` 或 `model3.json` 文件名

```bash
# 正确的目录结构
public/
└── models/
    └── live2d/
        └── hiyori/
            ├── hiyori.model3.json  ← 路径: /models/live2d/hiyori/hiyori.model3.json
            ├── hiyori.moc3
            └── ...
```

---

### 2. 模型显示不完整或变形

**问题**: Avatar 只显示一部分或拉伸

**解决方案**:
```typescript
<AvatarStage
  config={{
    modelPath: "...",
    scale: 0.15,    // 调小缩放
    x: 0,           // 调整 X 偏移
    y: 100,         // 调整 Y 偏移
  }}
  height="600px"  // 增加容器高度
/>
```

---

### 3. 表情切换无效

**问题**: 调用 `setExpression()` 没有反应

**原因**: 模型可能没有该表情

**解决方案**:
1. 检查模型的 `expressions/` 文件夹
2. 查看 `model3.json` 中的表情列表
3. 使用实际存在的表情名

```bash
# 查看模型支持的表情
cat public/models/live2d/hiyori/hiyori.model3.json | grep -A 5 "Expressions"
```

---

### 4. 鼠标追踪不工作

**问题**: Avatar 视线不跟随鼠标

**解决方案**:
```typescript
<AvatarStage
  config={{
    mouseLookEnabled: true,  // 确保启用
    // ...
  }}
/>
```

如果仍不工作，可能是模型不支持 `ParamAngleX/Y` 参数。

---

### 5. 自动眨眼失效

**问题**: Avatar 不眨眼

**原因**: 模型参数名称不同

**解决方案**:
编辑 `src/lib/avatar/live2d-manager.ts`，修改参数名：
```typescript
// 尝试不同的参数名
this.model.internalModel?.coreModel?.setParameterValueById?.(
  "PARAM_EYE_L_OPEN",  // 或 "ParamEyeLOpen" / "EyeOpenL"
  0
);
```

---

### 6. 找不到免费的 Live2D 模型

**解决方案**:

**选项 1: 使用占位符（测试用）**

创建一个简单的占位符组件：
```typescript
// src/components/avatar/PlaceholderAvatar.tsx
export default function PlaceholderAvatar() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-bounce">🧸</div>
        <p className="text-gray-600">Live2D Model Placeholder</p>
        <p className="text-sm text-gray-500 mt-2">
          请放置 Live2D 模型文件
        </p>
      </div>
    </div>
  );
}
```

**选项 2: 下载官方示例**

```bash
# 使用官方 Hiyori 模型
cd public/models/live2d
git clone https://github.com/guansss/pixi-live2d-display.git temp
cp -r temp/test/models/hiyori ./
rm -rf temp
```

**选项 3: 使用 VRM 代替**

VRM 是开源格式，模型更容易获取：
- VRoid Hub: https://hub.vroid.com
- 需要额外的 VRM 加载器

---

## 性能优化建议

### 1. 模型文件优化

```typescript
// 使用较小的纹理
// 建议纹理尺寸: 2048x2048 或更小
// 减少 motions 和 expressions 数量
```

### 2. 懒加载

```typescript
"use client";

import dynamic from "next/dynamic";

// 动态导入 Avatar 组件
const AvatarStage = dynamic(
  () => import("@/components/avatar/AvatarStage"),
  { ssr: false }  // 禁用 SSR
);

export default function MyPage() {
  return <AvatarStage config={{ modelPath: "..." }} />;
}
```

### 3. 降低更新频率

```typescript
// 说话动画使用 RAF 而不是定时器
const speak = (isSpeaking: boolean) => {
  if (isSpeaking) {
    const animate = () => {
      // 更新嘴型
      if (isSpeaking) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
};
```

---

## MBTI 驱动的情绪系统

### 配置 MBTI 性格

```typescript
import { adjustEmotionByMBTI } from "@/lib/avatar/emotion";

const userMBTI = "ENFP";  // 用户的 MBTI 类型

// 分析文本情绪
const emotion = analyzeEmotion(text);

// 根据 MBTI 调整
const adjusted = adjustEmotionByMBTI(
  emotion.emotion,
  userMBTI,
  emotion.confidence
);

avatar.setEmotion(adjusted.emotion);
```

### MBTI 情绪倾向

```typescript
// ENFP 倾向: 兴奋、开心、惊讶
// INTJ 倾向: 思考、中性、困惑
// ESFJ 倾向: 开心、兴奋、悲伤
```

---

## 下一步

1. **获取 Live2D 模型**: 从上述资源下载或购买
2. **放置文件**: 复制到 `public/models/live2d/`
3. **配置路径**: 在代码中指定正确的 `modelPath`
4. **测试**: 访问 `/avatar-chat` 页面
5. **自定义**: 根据需要调整表情映射和关键词

---

## 支持

- **Live2D 官方文档**: https://docs.live2d.com
- **pixi-live2d-display**: https://github.com/guansss/pixi-live2d-display
- **问题反馈**: 提交 GitHub Issue

---

**祝你使用愉快！** 🎉

