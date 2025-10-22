# AI Chatpot - 智能虚拟伴侣

💖🧸 基于 Next.js + OpenAI + Prisma 的流式聊天应用，受 [AIRI](https://github.com/moeru-ai/airi) 项目启发，致力于打造一个自托管、可定制的 AI 伴侣系统。

**🖥️ 现已支持 Tauri 桌面应用！** 轻量级、原生性能、完全本地化。

## 项目愿景

借鉴 AIRI 项目的理念，将 AI 伴侣带入现实世界，提供实时语音交互、个性化记忆系统和虚拟形象展示。我们的目标是创建一个轻量级、易于部署的解决方案，支持 **Web**、**桌面（Tauri）** 和未来的 **iOS App Store**。

## 技术栈（已稳定）

- **前端**: Next.js 15 (App Router) + React 18 + TypeScript
- **UI**: Tailwind CSS
- **认证**: NextAuth (Email Magic Link)
- **AI模型**: OpenAI SDK (服务端流式)
- **数据库**: PostgreSQL + Prisma
- **本地存储**: DuckDB WASM (浏览器端)
- **缓存/限流**: Upstash Redis
- **部署**: Vercel (Web) / Tauri (Desktop)
- **桌面应用**: Tauri 2 (Rust + WebView)

## 快速开始

### 选择部署方式

本项目支持两种运行模式：

#### 🌐 Web 应用（推荐用于开发和云部署）

适合：远程访问、多用户、云端部署

#### 🖥️ 桌面应用（推荐用于个人使用）

适合：完全本地化、隐私保护、离线使用

**👉 桌面应用完整指南**: [TAURI_DESKTOP_GUIDE.md](./TAURI_DESKTOP_GUIDE.md)

---

### Web 应用安装

#### 1. 安装依赖

```bash
pnpm install
```

#### 2. 快速设置

运行自动设置脚本：

```bash
./setup.sh
```

或者手动配置：

#### 环境变量配置

复制 `env.example` 为 `.env.local` 并填入以下配置：

```bash
cp env.example .env.local
```

需要配置的环境变量：
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `OPENAI_API_KEY`: OpenAI API 密钥
- `NEXTAUTH_SECRET`: NextAuth 密钥（运行 `openssl rand -base64 32` 生成）
- `NEXTAUTH_URL`: 应用URL (开发环境: http://localhost:3000)
- `EMAIL_*`: 邮件服务器配置（Gmail/SendGrid/Mailgun等）
- `UPSTASH_REDIS_*`: Redis 配置（可选，用于限流）

#### 数据库设置

使用 Docker 启动本地 PostgreSQL：

```bash
# 启动数据库
docker compose up -d

# 推送数据库模式
pnpm db:push
```

#### 邮件服务配置

推荐使用以下服务之一：

**Gmail SMTP（免费）**：
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Your App <your-email@gmail.com>"
EMAIL_SECURE=false
```

**SendGrid（免费额度）**：
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM="Your App <no-reply@yourdomain.com>"
EMAIL_SECURE=false
```

#### Redis 配置（可选）

使用 Upstash Redis（免费额度）：

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 功能特性

### ✅ 已实现 (v0.1)

- ✅ **流式对话体验** - 基于 SSE 的实时打字效果
- ✅ **用户认证** - NextAuth 邮箱魔术链接登录
- ✅ **限流保护** - Upstash Redis 滑动窗口限流
- ✅ **内容安全过滤** - 基础关键词拦截
- ✅ **会话管理** - 上下文截断策略
- ✅ **反馈收集** - 用户反馈数据收集
- ✅ **监控埋点** - 自建 Metric 表记录

### 🎯 规划中 (v0.2+) - 受 AIRI 启发

> **重要约束**: 
> - 保持现有代码架构不变（Chat MVP + Prisma Schema + `/api/chat-fixed`）
> - 所有 API 密钥必须在服务端，不暴露给客户端
> - 遵循现有的安全过滤和截断策略
> - 只使用 Next.js App Router + TypeScript，不引入 Vue

#### 🎤 实时语音交互
- **语音输入**: 麦克风 → STT (Whisper API) → LLM → 响应
- **语音输出**: TTS (ElevenLabs/OpenAI TTS) → WebAudio 播放
- **实现方式**: 
  - `useVoice()` Hook 管理录音、转写、播放
  - `/api/stt` 端点处理语音转文字（服务端调用 Whisper）
  - `/api/tts` 端点返回音频流（服务端调用 TTS）

#### 🎭 虚拟形象展示
- **Live2D/VRM 支持**: `<AvatarStage/>` React 组件
- **表情系统**: 自动眨眼、视线追踪、情绪表情映射
- **MBTI 驱动**: 基于性格类型的表情和语气调整
- **技术选型**: 
  - Live2D Cubism SDK 或 VRM (pixiv/three-vrm)
  - WebGL + React Three Fiber
  - 表情与对话情绪实时同步

#### 🧠 本地记忆系统
- **浏览器端存储**: DuckDB WASM 存储 MBTI 配置、用户偏好、对话摘要
- **隐私优先**: 不存储 PII (个人身份信息)
- **数据同步**: 可选同步检查点到 PostgreSQL
- **实现方式**:
  - `useMemory()` Hook 管理本地记忆
  - `@duckdb/duckdb-wasm` 浏览器端数据库
  - 定期生成对话摘要并本地存储

#### 🎨 MBTI 个性化系统
- **性格驱动**: 基于 MBTI 类型生成系统提示词
- **语气映射**: 不同性格类型对应不同对话风格
- **表情映射**: MBTI → 情绪 → Avatar 表情
- **数据结构**:
  ```typescript
  interface MBTIProfile {
    type: 'INTJ' | 'ENFP' | ...; // 16 种类型
    traits: string[];              // 性格特征标签
    tone: 'formal' | 'friendly' | 'playful' | ...;
    expressionMap: Record<Emotion, Expression>;
  }
  ```

#### 📱 iOS App Store 就绪
- **WKWebView 兼容**: 确保所有功能在 WebView 中可用
- **Native Bridge**: `/api/native` 端点用于未来原生功能调用
- **避免浏览器不支持 API**: 如 Web Bluetooth、WebUSB 等
- **渐进增强**: 优先保证 Web 体验，原生功能可选

#### 🛠️ 管理后台
- **路由**: `/admin` 管理控制台
- **功能**: 
  - 用户管理、会话查看
  - Metrics 可视化、Feedback 分析
  - RBAC 权限控制（已有 Prisma User 表）
- **访问控制**: 基于 NextAuth Session 的管理员角色验证

## 项目结构

### 当前结构 (v0.1)

```
src/
├── app/                 # Next.js App Router
│   ├── api/
│   │   ├── chat-fixed/ # ✅ 流式聊天API (工作正常)
│   │   └── auth/       # ✅ NextAuth 端点
│   ├── (auth)/         # ✅ 认证页面
│   └── layout.tsx      # ✅ 根布局
├── components/         # ✅ React组件
│   ├── Chat.tsx        # 聊天容器
│   ├── MessageList.tsx # 消息列表
│   ├── Composer.tsx    # 输入框
│   └── FeedbackBar.tsx # 反馈组件
├── lib/                # ✅ 核心库
│   ├── openai.ts       # OpenAI客户端
│   ├── prompt.ts       # 提示词管理
│   ├── session.ts      # 会话管理
│   ├── guard.ts        # 内容治理
│   ├── ratelimit.ts    # 限流器
│   ├── db.ts           # 数据库客户端
│   ├── logger.ts       # 日志记录
│   └── env.ts          # 环境变量验证
└── types/              # ✅ TypeScript类型
    └── chat.ts         # 聊天相关类型
```

### 计划扩展 (v0.2+) - 仅增量添加

```diff
src/
├── app/
│   ├── api/
+│   │   ├── stt/       # 🎤 语音转文字端点
+│   │   ├── tts/       # 🎤 文字转语音端点
+│   │   └── native/    # 📱 iOS Native Bridge
+│   ├── admin/         # 🛠️ 管理后台
+│   │   ├── users/
+│   │   ├── metrics/
+│   │   └── feedback/
│   └── ...
├── components/
+│   ├── avatar/        # 🎭 虚拟形象组件
+│   │   ├── AvatarStage.tsx    # Live2D/VRM 容器
+│   │   ├── Live2DRenderer.tsx # Live2D 渲染器
+│   │   └── VRMRenderer.tsx    # VRM 渲染器
+│   ├── voice/         # 🎤 语音组件
+│   │   ├── VoiceRecorder.tsx
+│   │   └── AudioPlayer.tsx
│   └── ...
├── hooks/             # 🔧 React Hooks
+│   ├── useVoice.ts   # 语音交互管理
+│   ├── useMemory.ts  # 本地记忆管理
+│   └── useAvatar.ts  # Avatar 状态管理
├── lib/
+│   ├── memory/        # 🧠 记忆系统
+│   │   ├── duckdb.ts      # DuckDB WASM 客户端
+│   │   ├── mbti.ts        # MBTI 配置管理
+│   │   └── summarizer.ts  # 对话摘要生成
+│   ├── avatar/        # 🎭 Avatar 逻辑
+│   │   ├── expression.ts  # 表情映射
+│   │   └── emotion.ts     # 情绪分析
│   └── ...
└── types/
+    ├── mbti.ts        # MBTI 类型定义
+    ├── avatar.ts      # Avatar 类型定义
+    └── voice.ts       # 语音类型定义
```

## 开发原则

### 🔒 安全与隐私
- **服务端优先**: 所有 API 密钥（OpenAI、ElevenLabs 等）仅存在于服务端
- **隐私保护**: DuckDB 本地存储不包含 PII
- **内容治理**: 保持现有的 `guard.ts` 过滤机制
- **限流保护**: Redis 限流防止滥用

### 📐 架构约束
- **不破坏现有功能**: 新功能仅增量添加
- **保持现有路由**: `/api/chat-fixed` 保持不变
- **Prisma Schema 兼容**: 扩展时不破坏现有模型关系
- **TypeScript 严格模式**: 所有新代码必须通过类型检查

### 🎨 代码风格
- **注释要求**: 关键逻辑添加 `// Why` 和 `// How` 注释
- **最小化原则**: 避免过度工程，优先简单可维护的方案
- **生产安全**: 所有新功能必须考虑错误处理和降级方案

## 部署

### Web 应用部署（Vercel）

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 桌面应用部署（Tauri）

**完整指南**: [TAURI_DESKTOP_GUIDE.md](./TAURI_DESKTOP_GUIDE.md)

快速命令：

```bash
# 开发模式
pnpm tauri:dev

# 构建应用（生成安装包）
pnpm tauri:build
```

构建产物：
- **macOS**: `.dmg` 安装包
- **Windows**: `.msi` 安装包
- **Linux**: `.AppImage` 可执行文件

### 数据库部署

推荐使用 Neon、Railway 或 Supabase 作为 PostgreSQL 提供商。

## 开发说明

### 基础工具
- **包管理器**: `pnpm` (锁定版本 `10.17.1`)
- **代码格式化**: Prettier
- **类型检查**: TypeScript (strict mode)
- **样式**: Tailwind CSS v4.1

### Git 提交规范
- `feat(scope): description` - 新功能
- `fix(scope): description` - 修复
- `chore(scope): description` - 构建/配置更新
- `docs(scope): description` - 文档更新

示例:
```bash
git commit -m "feat(avatar): add Live2D renderer component"
git commit -m "fix(voice): handle microphone permission denial"
```

## 📋 需要准备的材料清单

在开始使用本项目前，请准备以下材料和账号。以下分为**必需**和**可选**两类。

### ✅ 必需材料

| 材料 | 说明 | 获取方式 | 用途 |
|------|------|---------|------|
| **OpenAI API Key** | OpenAI 开发者密钥 | [platform.openai.com](https://platform.openai.com/api-keys) | 聊天、语音转文字、文字转语音 |
| **PostgreSQL 数据库** | 关系型数据库 | Docker（本地）或 [Neon](https://neon.tech)/[Supabase](https://supabase.com) | 存储用户、会话、消息 |
| **NEXTAUTH_SECRET** | 认证密钥 | `openssl rand -base64 32` | NextAuth 会话加密 |

### 🔧 可选材料（增强功能）

| 材料 | 说明 | 获取方式 | 用途 |
|------|------|---------|------|
| **SMTP 邮件服务** | 邮件发送服务 | [Gmail](https://support.google.com/mail/answer/185833), [SendGrid](https://sendgrid.com), [Mailgun](https://www.mailgun.com) | 邮箱魔法链接登录 |
| **Upstash Redis** | 无服务器 Redis | [console.upstash.com](https://console.upstash.com) | API 请求限流、缓存 |
| **ElevenLabs API Key** | 语音合成服务 | [elevenlabs.io](https://elevenlabs.io) | 高质量 TTS（可选，有 OpenAI TTS 替代） |
| **Live2D 模型** | 虚拟角色模型 | [Live2D 官网](https://www.live2d.com), Booth, VRoid Hub | 虚拟形象展示 |
| **应用图标** | 1024x1024 PNG | 自己设计或 [Figma](https://figma.com) | 桌面应用图标（仅 Tauri） |

### 📝 详细获取指南

#### 1. OpenAI API Key（必需）

1. 访问 [OpenAI Platform](https://platform.openai.com/signup)
2. 注册并登录账号
3. 前往 [API Keys 页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制密钥（仅显示一次，请妥善保管）
6. 充值账户余额（建议至少 $5）

**费用估算**:
- GPT-4o-mini: $0.15/1M tokens (输入), $0.60/1M tokens (输出)
- Whisper: $0.006/分钟
- TTS: $15/1M 字符

#### 2. PostgreSQL 数据库（必需）

**方式 A: Docker 本地运行（开发推荐）**
```bash
# 已包含在项目中
docker compose up -d
```

**方式 B: 云端数据库（生产推荐）**

| 服务商 | 免费额度 | 注册链接 |
|--------|---------|---------|
| **Neon** | 1个项目, 512MB | [neon.tech](https://neon.tech) |
| **Supabase** | 500MB, 2个项目 | [supabase.com](https://supabase.com) |
| **Railway** | $5/月试用 | [railway.app](https://railway.app) |
| **Vercel Postgres** | 256MB | [vercel.com](https://vercel.com/storage/postgres) |

#### 3. SMTP 邮件服务（可选，登录功能）

**Gmail（开发推荐）**:
1. 开启两步验证
2. 生成应用专用密码
3. 使用生成的密码作为 `EMAIL_SERVER_PASSWORD`

配置示例:
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_SECURE=false
```

**SendGrid（生产推荐）**:
1. 注册 [SendGrid](https://sendgrid.com)
2. 免费额度: 100封/天
3. 创建 API Key
4. 验证发件人邮箱

#### 4. Upstash Redis（可选，限流功能）

1. 访问 [console.upstash.com](https://console.upstash.com)
2. 注册并登录
3. 创建新数据库（选择 REST API）
4. 复制 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

**免费额度**: 10,000 命令/天

#### 5. Live2D 模型（可选，虚拟形象）

**免费资源**:
- [Live2D 官方示例](https://www.live2d.com/en/download/sample-data/)
- [nizizi 模型库](https://github.com/nizizi/live2d-models)
- [VRoid Hub](https://hub.vroid.com)（VRM 格式）

**商业模型**:
- [Booth](https://booth.pm)（日本同人市场）
- 委托设计师制作

**文件结构**:
```
public/live2d/
└── your-model/
    ├── your-model.model3.json
    ├── textures/
    ├── motions/
    └── expressions/
```

#### 6. 应用图标（可选，桌面应用）

**要求**:
- 尺寸: 1024x1024 或 512x512
- 格式: PNG（透明背景）
- 内容: 应用 Logo 或角色形象

**生成工具**:
- [Tauri Icon CLI](https://tauri.app/distribute/): `pnpm tauri icon icon.png`
- [Figma](https://figma.com)
- [Canva](https://canva.com)

### 💰 预算估算

| 项目 | 开发阶段 | 生产阶段（月） |
|------|---------|--------------|
| OpenAI API | $5-10 | $10-50 |
| PostgreSQL | 免费（Docker） | 免费-$10 |
| SMTP 邮件 | 免费（Gmail） | $0-15（SendGrid） |
| Redis | 免费 | 免费-$10 |
| 域名 + SSL | - | $10-20/年 |
| **总计** | **$5-10** | **$10-85/月** |

### 📦 材料检查清单

使用前请确认：

- [ ] 已获取 OpenAI API Key
- [ ] 已设置 PostgreSQL 数据库
- [ ] 已生成 NEXTAUTH_SECRET
- [ ] 已配置 .env.local 文件
- [ ] （可选）已配置 SMTP 邮件服务
- [ ] （可选）已配置 Upstash Redis
- [ ] （可选）已准备 Live2D 模型文件
- [ ] （可选）已准备应用图标（Tauri）

### 🆘 获取帮助

如果在准备材料时遇到问题：
1. 查看 [USER_MANUAL.md](./USER_MANUAL.md) 完整使用手册
2. 查看各服务商官方文档
3. 在 GitHub Issues 提问

---

## 重新启动项目

```bash
# 启动数据库
docker compose up -d

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

**完整使用手册**: 📖 [USER_MANUAL.md](./USER_MANUAL.md)

## 致谢与灵感来源

本项目深受 [AIRI](https://github.com/moeru-ai/airi) 项目启发：

> 💖🧸 Self hosted, you owned Grok Companion, a container of souls of waifu, cyber livings to bring them into our worlds, wishing to achieve Neuro-sama's altitude.

**我们学习了 AIRI 的理念**:
- 自托管、用户拥有数据
- 实时语音交互能力
- 虚拟形象与个性化系统
- 模块化、可扩展的架构

**我们的差异化**:
- Web 优先，轻量级部署
- Next.js + TypeScript 技术栈
- iOS App Store 就绪
- 简化的功能集，专注核心体验

特别感谢:
- [AIRI 项目](https://github.com/moeru-ai/airi) - 核心理念与功能启发
- [pixiv/ChatVRM](https://github.com/pixiv/ChatVRM) - VRM Avatar 实现参考
- OpenAI - GPT 模型与 Whisper/TTS API
- Vercel - Next.js 框架与部署平台

## License

MIT License - 自由使用、修改、分发

---

**项目状态**: 🚧 积极开发中 | v0.1 已完成 | v0.2 规划中

---

## 📖 快速命令参考

### 🛠️ 开发命令

```bash
# Web 应用
pnpm dev                  # 启动开发服务器
pnpm build                # 构建生产版本
pnpm start                # 运行生产构建
pnpm lint                 # 运行 ESLint

# 数据库
pnpm db:generate          # 生成 Prisma 客户端
pnpm db:push              # 推送 schema 到数据库
pnpm db:migrate           # 创建并应用迁移

# Tauri 桌面应用
pnpm tauri:dev            # 启动桌面应用开发模式
pnpm tauri:build          # 构建桌面应用安装包
pnpm tauri:build:debug    # 构建调试版本（更快）
pnpm tauri icon <path>    # 生成应用图标

# Docker
docker compose up -d      # 启动数据库
docker compose down       # 停止数据库
docker compose ps         # 查看容器状态

# 健康检查
./health-check.sh         # 运行项目健康检查
```

### 📋 常用工作流

**首次设置**:
```bash
pnpm install
cp env.local.example .env.local
# 编辑 .env.local 填入配置
docker compose up -d
pnpm db:push
pnpm dev
```

**日常开发（Web）**:
```bash
docker compose up -d      # 启动数据库
pnpm dev                 # 启动应用
# 开发...
# Ctrl+C 停止
docker compose down       # 停止数据库
```

**日常开发（桌面）**:
```bash
pnpm tauri:dev           # 一键启动（包含 Next.js）
# 开发...
# Ctrl+C 停止
```

**生产构建**:
```bash
# Web 应用
pnpm build               # 生成 .next/ 目录

# 桌面应用
pnpm tauri:build         # 生成安装包（.dmg, .msi, .AppImage）
```

---

## 📂 项目文件指南

| 文件 | 用途 | 何时查看 |
|------|------|---------|
| **README.md** | 项目概览、快速开始 | 第一次使用 |
| **USER_MANUAL.md** | 完整使用手册 | 需要详细操作指南 |
| **TAURI_DESKTOP_GUIDE.md** | 桌面应用指南 | 打包桌面应用 |
| **VOICE_SYSTEM.md** | 语音功能文档 | 使用语音聊天 |
| **AVATAR_GUIDE.md** | Live2D 角色指南 | 添加虚拟形象 |
| **MEMORY_SYSTEM.md** | 本地记忆系统 | 使用本地数据库 |
| **PROJECT_STATUS.md** | 项目状态报告 | 了解开发进度 |
| **env.local.example** | 环境变量模板 | 配置环境 |

---

如有问题或建议，欢迎提交 Issue 或 Pull Request！

**🔍 运行健康检查**: `./health-check.sh`  
**📖 完整手册**: [USER_MANUAL.md](./USER_MANUAL.md)