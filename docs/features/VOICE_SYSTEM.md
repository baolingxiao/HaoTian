# 🎤 语音聊天系统实现文档

## 📋 目录
1. [系统架构](#系统架构)
2. [文件结构](#文件结构)
3. [核心组件详解](#核心组件详解)
4. [API 端点](#api-端点)
5. [使用指南](#使用指南)
6. [配置说明](#配置说明)
7. [常见问题](#常见问题)

---

## 系统架构

### 数据流程图

```
浏览器端                            服务端
┌─────────────────┐                ┌──────────────────┐
│  用户说话 🎤    │                │                  │
└────────┬────────┘                │                  │
         │                         │                  │
         ▼                         │                  │
┌─────────────────┐                │                  │
│ MediaRecorder   │                │                  │
│ 录制音频 Blob    │                │                  │
└────────┬────────┘                │                  │
         │                         │                  │
         │ POST /api/stt           │                  │
         └────────────────────────►│  Whisper API     │
                                   │  (STT)           │
                                   └────────┬─────────┘
                                            │
                                            │ 返回文字
                                            ▼
┌─────────────────┐                ┌──────────────────┐
│ 显示转写文本    │◄───────────────┤  转写结果        │
└────────┬────────┘                └──────────────────┘
         │
         │ POST /api/chat-fixed
         └────────────────────────►┌──────────────────┐
                                   │  OpenAI GPT      │
                                   │  (LLM)           │
                                   └────────┬─────────┘
                                            │
                                            │ 流式响应
                                            ▼
┌─────────────────┐                ┌──────────────────┐
│ 显示 AI 回复    │◄───────────────┤  AI 回复文本     │
└────────┬────────┘                └──────────────────┘
         │
         │ POST /api/tts
         └────────────────────────►┌──────────────────┐
                                   │  OpenAI TTS /    │
                                   │  ElevenLabs      │
                                   └────────┬─────────┘
                                            │
                                            │ 返回音频
                                            ▼
┌─────────────────┐                ┌──────────────────┐
│ WebAudio 播放 🔊│◄───────────────┤  MP3 音频流      │
└─────────────────┘                └──────────────────┘
```

### 技术选型理由

| 技术 | 选择理由 |
|------|---------|
| **MediaRecorder API** | 浏览器原生 API，无需额外依赖，支持所有现代浏览器 |
| **OpenAI Whisper** | 高准确率，支持多语言，API 简单易用 |
| **OpenAI TTS** | 自然语音，低延迟，与 GPT 集成方便 |
| **ElevenLabs** | 可选项，更自然的语音，支持自定义声音 |
| **服务端 API** | 保护 API 密钥安全，统一限流和监控 |

---

## 文件结构

```
src/
├── types/
│   └── voice.ts                    # 语音系统类型定义
│
├── hooks/
│   └── useVoice.ts                 # 核心 Hook（状态管理 + API 调用）
│
├── components/
│   └── voice/
│       ├── VoiceRecorder.tsx       # 录音 UI 组件
│       └── AudioPlayer.tsx         # 播放器 UI 组件
│
├── app/
│   ├── api/
│   │   ├── stt/route.ts            # 语音转文字 API
│   │   └── tts/route.ts            # 文字转语音 API
│   │
│   └── voice/page.tsx              # 语音聊天演示页面
│
└── lib/
    └── env.ts                      # 环境变量（新增 ELEVENLABS_API_KEY）
```

---

## 核心组件详解

### 1. `useVoice.ts` Hook

**职责**: 封装所有语音交互逻辑

**主要功能**:
```typescript
// 状态管理
status: VoiceStatus              // 当前状态：idle | recording | processing | speaking | error
isRecording: boolean             // 是否正在录音
isSpeaking: boolean              // 是否正在播放
error: VoiceError | null         // 错误信息
transcription: string            // 转写结果
audioUrl: string | null          // 音频 URL

// 核心方法
startRecording()                 // 开始录音
stopRecording()                  // 停止录音
cancelRecording()                // 取消录音
speak(text: string)              // 文字转语音并播放
stopSpeaking()                   // 停止播放

// 配置
config: VoiceConfig              // 当前配置
updateConfig()                   // 更新配置
```

**核心实现**:

1. **录音流程**:
```typescript
// 1. 请求麦克风权限
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 2. 创建 MediaRecorder
const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

// 3. 收集音频数据
mediaRecorder.ondataavailable = (event) => {
  audioChunksRef.current.push(event.data);
};

// 4. 录音结束后合并 Blob
mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
  await transcribeAudio(audioBlob);
};
```

2. **STT 调用**:
```typescript
const formData = new FormData();
formData.append("audio", audioBlob, "recording.webm");

const response = await fetch("/api/stt", {
  method: "POST",
  body: formData,
});

const result = await response.json();
setTranscription(result.text);
```

3. **TTS 调用**:
```typescript
const response = await fetch("/api/tts", {
  method: "POST",
  body: JSON.stringify({ text, voice, provider }),
});

const audioBlob = await response.blob();
const url = URL.createObjectURL(audioBlob);

const audio = new Audio(url);
await audio.play();
```

**为什么这样设计**:
- ✅ **单一职责**: Hook 只管理状态和 API 调用，UI 由组件负责
- ✅ **可复用**: 其他页面也能使用这个 Hook
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **错误处理**: 统一的错误处理机制

---

### 2. `VoiceRecorder.tsx` 组件

**职责**: 提供录音 UI 和状态可视化

**主要特性**:
- 🎯 **视觉反馈**: 录音时的脉冲动画
- ⏱️ **录音计时**: 显示录音时长
- 🎨 **状态图标**: 不同状态显示不同图标和颜色
- ❌ **错误提示**: 友好的错误信息和解决方案

**核心逻辑**:
```typescript
// 录音计时
useEffect(() => {
  if (voice.isRecording) {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }
}, [voice.isRecording]);

// 转写完成回调
useEffect(() => {
  if (voice.transcription && onTranscriptionComplete) {
    onTranscriptionComplete(voice.transcription);
  }
}, [voice.transcription]);
```

**为什么这样设计**:
- ✅ **受控组件**: 所有状态由 Hook 管理
- ✅ **回调机制**: 转写完成后通知父组件
- ✅ **无障碍设计**: 提供清晰的视觉和文字提示

---

### 3. `AudioPlayer.tsx` 组件

**职责**: 音频播放的可视化界面

**主要特性**:
- 🎵 **进度条**: 显示播放进度
- 🌊 **波形动画**: 模拟音频波形
- ⏯️ **播放控制**: 播放/暂停按钮
- 📥 **下载功能**: 支持下载音频文件

**为什么这样设计**:
- ✅ **纯展示组件**: 不包含业务逻辑
- ✅ **动画效果**: 提供更好的用户体验
- ✅ **可扩展**: 未来可接入真实的音频分析

---

## API 端点

### `/api/stt` - 语音转文字

**请求**:
```typescript
POST /api/stt
Content-Type: multipart/form-data

{
  audio: File           // 音频文件（必填）
  language: string      // 语言代码（可选，如 'zh', 'en'）
}
```

**响应**:
```json
{
  "text": "你好，我是 AI 助手",
  "language": "zh",
  "duration": 3.5
}
```

**实现细节**:
```typescript
// 1. 限流检查
if (limiter) {
  const { success } = await limiter.limit(ip);
  if (!success) return 429;
}

// 2. 调用 Whisper API
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: language || undefined,
  response_format: "verbose_json",
});

// 3. 返回结果
return NextResponse.json({
  text: transcription.text,
  language: transcription.language,
  duration: transcription.duration,
});
```

**为什么在服务端**:
- 🔒 **安全**: API Key 不暴露给客户端
- 📊 **监控**: 统一记录和监控
- 🚦 **限流**: 防止滥用

---

### `/api/tts` - 文字转语音

**请求**:
```typescript
POST /api/tts
Content-Type: application/json

{
  text: string              // 文本内容（必填）
  provider: "openai" | "elevenlabs"  // TTS 提供商（默认 openai）
  voice: string             // 语音 ID 或名称
}
```

**响应**:
```
Content-Type: audio/mpeg
Content-Length: 123456

[音频二进制数据]
```

**实现细节**:

**OpenAI TTS**:
```typescript
const mp3 = await openai.audio.speech.create({
  model: "tts-1",  // 或 "tts-1-hd"
  voice: voice,    // alloy, echo, fable, onyx, nova, shimmer
  input: text,
  response_format: "mp3",
  speed: 1.0,
});

const buffer = Buffer.from(await mp3.arrayBuffer());
return new Response(buffer, {
  headers: { "Content-Type": "audio/mpeg" },
});
```

**ElevenLabs TTS**:
```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
    }),
  }
);

return new Response(await response.arrayBuffer(), {
  headers: { "Content-Type": "audio/mpeg" },
});
```

**为什么支持两个提供商**:
- 🎭 **灵活性**: 用户可以选择喜欢的语音
- 💰 **成本优化**: ElevenLabs 可能更便宜或更好听
- 🔄 **容错**: 一个服务不可用时可切换

---

## 使用指南

### 快速开始

1. **安装依赖** (已经完成):
```bash
pnpm install
```

2. **配置环境变量**:
```bash
# .env.local
OPENAI_API_KEY=sk-xxx         # 必须（用于 Whisper + TTS）
ELEVENLABS_API_KEY=xxx        # 可选（如果使用 ElevenLabs）
```

3. **启动服务**:
```bash
# 启动数据库
docker compose up -d

# 启动应用
pnpm dev
```

4. **访问演示页面**:
```
http://localhost:3000/voice
```

---

### 在你的页面中集成

#### 方式 1: 使用完整组件

```typescript
import { useVoice } from "@/hooks/useVoice";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import AudioPlayer from "@/components/voice/AudioPlayer";

export default function MyPage() {
  const voice = useVoice({
    ttsProvider: "openai",
    voice: "nova",
  });

  return (
    <div>
      <VoiceRecorder
        voice={voice}
        onTranscriptionComplete={(text) => {
          console.log("User said:", text);
          // 处理转写结果
        }}
      />
      <AudioPlayer voice={voice} />
    </div>
  );
}
```

#### 方式 2: 仅使用 Hook

```typescript
import { useVoice } from "@/hooks/useVoice";

export default function MyComponent() {
  const voice = useVoice();

  const handleVoiceInput = async () => {
    await voice.startRecording();
    // 用户说话...
    await voice.stopRecording();
    // 自动转写
    console.log(voice.transcription);
  };

  const handleVoiceOutput = async () => {
    await voice.speak("你好，我是 AI 助手");
  };

  return (
    <div>
      <button onClick={handleVoiceInput}>录音</button>
      <button onClick={handleVoiceOutput}>播放</button>
      <p>{voice.transcription}</p>
    </div>
  );
}
```

---

## 配置说明

### VoiceConfig 类型

```typescript
interface VoiceConfig {
  // STT 配置
  sttProvider: "whisper" | "local";
  language?: string;           // 语言代码（'zh', 'en', 'ja', 'ko' 等）
  
  // TTS 配置
  ttsProvider: "elevenlabs" | "openai";
  voice?: string;              // 语音 ID 或名称
  
  // 音频配置
  sampleRate?: number;         // 采样率（16000 推荐）
  encoding?: "mp3" | "opus" | "pcm16";
}
```

### OpenAI TTS 语音选项

| Voice | 描述 | 适用场景 |
|-------|------|---------|
| `alloy` | 中性、平衡 | 通用 |
| `echo` | 男性、清晰 | 新闻播报 |
| `fable` | 英式口音 | 故事讲述 |
| `onyx` | 深沉、权威 | 专业内容 |
| `nova` | 女性、友好 | 客服助手 |
| `shimmer` | 温柔、柔和 | 冥想引导 |

### ElevenLabs 语音选项

需要从 [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) 获取 Voice ID。

流行选择:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (女性)
- `AZnzlk1XvdvUeBnXmlld` - Domi (女性)
- `EXAVITQu4vr4xnSDxMaL` - Bella (女性)
- `ErXwobaYiN019PkySvjV` - Antoni (男性)

---

## 常见问题

### 1. 麦克风权限被拒绝

**错误**: `NotAllowedError: Permission denied`

**解决方案**:
1. 检查浏览器权限设置
2. 确保网站使用 HTTPS（或 localhost）
3. 清除浏览器权限缓存并重新授权

**代码处理**:
```typescript
if (err.name === "NotAllowedError") {
  setError({
    code: "PERMISSION_DENIED",
    message: "请在浏览器设置中允许访问麦克风",
  });
}
```

---

### 2. 找不到麦克风设备

**错误**: `NotFoundError: Requested device not found`

**解决方案**:
1. 检查麦克风是否连接
2. 检查系统声音设置
3. 尝试其他浏览器

---

### 3. STT API 返回 401

**错误**: `401 Unauthorized`

**解决方案**:
1. 检查 `.env.local` 中的 `OPENAI_API_KEY`
2. 确保 API Key 有效且未过期
3. 验证 API Key 有 Whisper 访问权限

---

### 4. 音频无法播放

**错误**: `Failed to play audio`

**解决方案**:
1. 检查浏览器是否支持自动播放（可能需要用户交互）
2. 验证返回的音频格式正确
3. 检查网络连接

**代码处理**:
```typescript
// 需要用户交互才能播放
document.addEventListener("click", async () => {
  try {
    await audio.play();
  } catch (e) {
    console.error("Autoplay failed:", e);
  }
}, { once: true });
```

---

### 5. ElevenLabs API 配置

**问题**: ElevenLabs TTS 不工作

**解决方案**:
1. 获取 API Key: https://elevenlabs.io/
2. 配置环境变量:
```bash
ELEVENLABS_API_KEY=your-key-here
```
3. 选择正确的 Voice ID
4. 检查 API 配额

---

## 性能优化建议

### 1. 音频压缩

```typescript
// 使用更低的采样率（质量与大小平衡）
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    sampleRate: 16000,  // 而不是 48000
    channelCount: 1,    // 单声道
  },
});
```

### 2. 缓存音频

```typescript
// 缓存常用短语的音频
const audioCache = new Map<string, string>();

async function speak(text: string) {
  if (audioCache.has(text)) {
    const url = audioCache.get(text)!;
    const audio = new Audio(url);
    await audio.play();
    return;
  }
  
  // 生成新音频...
  audioCache.set(text, url);
}
```

### 3. 预加载音频

```typescript
// 在 LLM 生成回复的同时调用 TTS
const [llmResponse, ttsAudio] = await Promise.all([
  fetch("/api/chat", { ... }),
  fetch("/api/tts", { body: JSON.stringify({ text: preloadText }) }),
]);
```

---

## 安全性说明

### ✅ 已实现的安全措施

1. **API Key 保护**: 所有密钥仅存在于服务端
2. **限流保护**: 使用 Redis 限制请求频率
3. **输入验证**: 验证音频文件和文本内容
4. **错误处理**: 不暴露敏感信息

### 🔒 生产环境建议

1. **添加认证**: 使用 NextAuth 保护语音 API
2. **文件大小限制**: 限制上传音频大小（如 10MB）
3. **内容审核**: 对转写文本进行内容过滤
4. **监控告警**: 记录异常请求和高频用户

```typescript
// 添加文件大小限制
if (audioFile.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: "File too large (max 10MB)" },
    { status: 400 }
  );
}
```

---

## 扩展建议

### 1. 添加流式 TTS

```typescript
// 边生成边播放，降低首字节时间
const stream = await openai.audio.speech.create({
  model: "tts-1",
  voice: "nova",
  input: text,
  response_format: "mp3",
  stream: true,
});

// 使用 MediaSource 流式播放
```

### 2. 语音活动检测 (VAD)

```typescript
// 自动检测说话开始和结束
import { VoiceActivityDetector } from "vad-library";

const vad = new VoiceActivityDetector();
vad.on("speech_start", () => startRecording());
vad.on("speech_end", () => stopRecording());
```

### 3. 多语言支持

```typescript
// 自动检测语言
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  // 不指定 language，让 Whisper 自动检测
});

// 根据检测到的语言选择对应的 TTS 语音
const ttsVoice = languageToVoice[transcription.language];
```

---

## 总结

这个语音聊天系统提供了：

✅ **完整的语音交互**: 录音 → STT → LLM → TTS → 播放  
✅ **模块化设计**: 每个部分都可独立使用  
✅ **类型安全**: 完整的 TypeScript 支持  
✅ **易于集成**: 简单的 Hook API  
✅ **可扩展**: 支持多个 TTS 提供商  
✅ **生产就绪**: 包含错误处理、限流、监控  

**下一步**:
- 🎭 集成 Live2D/VRM Avatar
- 🧠 添加 MBTI 驱动的语气调整
- 📱 优化移动端体验
- 🌐 支持更多语言和方言

---

**有问题？** 查看 [README.md](./README.md) 或提交 Issue！

