# 📖 AI Chatpot 用户手册

完整的项目使用指南，包含启动、使用、调试和关闭流程。

---

## 目录

1. [快速启动](#快速启动)
2. [Web 应用使用](#web-应用使用)
3. [桌面应用使用](#桌面应用使用)
4. [功能模块使用](#功能模块使用)
5. [常见问题](#常见问题)
6. [故障排除](#故障排除)
7. [关闭和清理](#关闭和清理)

---

## 快速启动

### 前置条件检查

在启动项目前，确保已安装：

```bash
# 检查 Node.js（需要 18.x 或更高）
node --version

# 检查 pnpm
pnpm --version

# 检查 Docker（如果使用本地数据库）
docker --version

# 检查 Rust（仅桌面应用需要）
rustc --version
```

---

## Web 应用使用

### 1️⃣ 初次启动（完整流程）

#### 步骤 1: 安装依赖

```bash
cd /Users/dai/Desktop/AI_Chatpot
pnpm install
```

**预计时间**: 2-5 分钟

#### 步骤 2: 配置环境变量

```bash
# 复制环境变量模板
cp env.local.example .env.local

# 编辑 .env.local，填入真实配置
open .env.local  # macOS
# 或者使用任何文本编辑器
```

**必填项**:
- `DATABASE_URL`: PostgreSQL 连接字符串
- `OPENAI_API_KEY`: OpenAI API 密钥
- `NEXTAUTH_SECRET`: 运行 `openssl rand -base64 32` 生成
- `NEXTAUTH_URL`: `http://localhost:3000`

**可选项**:
- `EMAIL_*`: 邮件登录功能（不配置则无法使用邮箱登录）
- `UPSTASH_REDIS_*`: Redis 限流（不配置则跳过限流）
- `ELEVENLABS_API_KEY`: ElevenLabs TTS（不配置则仅支持 OpenAI TTS）

#### 步骤 3: 启动数据库

**方式 A: 使用 Docker（推荐）**

```bash
# 启动 PostgreSQL 容器
docker compose up -d

# 验证数据库运行
docker compose ps
```

**方式 B: 使用云数据库**

跳过此步骤，直接使用云端 PostgreSQL（如 Neon、Supabase、Railway）

#### 步骤 4: 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库 schema
pnpm db:push
```

**预计时间**: 30 秒 - 1 分钟

#### 步骤 5: 启动开发服务器

```bash
pnpm dev
```

**输出示例**:
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.3s
```

#### 步骤 6: 访问应用

打开浏览器访问: **http://localhost:3000**

---

### 2️⃣ 日常启动（快速）

如果已经完成初次设置：

```bash
# 终端 1: 启动数据库（如果使用 Docker）
docker compose up -d

# 终端 2: 启动应用
pnpm dev
```

---

### 3️⃣ 页面导航

| 路径 | 功能 | 说明 |
|------|------|------|
| `/` | 基础聊天 | 文本对话界面 |
| `/voice` | 语音聊天 | 麦克风输入 + TTS 输出 |
| `/avatar-chat` | 虚拟形象聊天 | Live2D 角色 + 聊天 |
| `/memory-demo` | 本地记忆演示 | DuckDB 数据管理 |
| `/signin` | 登录页面 | NextAuth 邮箱登录 |

---

### 4️⃣ 停止 Web 应用

```bash
# 在运行 pnpm dev 的终端按:
Ctrl + C

# 停止数据库（如果使用 Docker）
docker compose down

# 如果需要清除数据库数据
docker compose down -v
```

---

## 桌面应用使用

### 1️⃣ 首次构建

#### 步骤 1: 安装 Rust

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 重启终端后验证
rustc --version
```

**Windows**: 下载并安装 [Rust](https://www.rust-lang.org/tools/install)

#### 步骤 2: 准备应用图标

**方式 A: 自动生成（推荐）**

```bash
# 准备一张 1024x1024 或 512x512 的 PNG 图片
pnpm tauri icon path/to/your-icon.png
```

**方式 B: 手动准备**

将以下文件放入 `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

#### 步骤 3: 开发模式启动

```bash
pnpm tauri:dev
```

**首次运行会发生什么**:
1. 编译 Rust 后端（2-5 分钟，仅首次）
2. 启动 Next.js 开发服务器
3. 打开桌面窗口
4. 自动打开开发者工具（调试用）

**注意**: 首次编译 Rust 会下载大量依赖，请耐心等待。

---

### 2️⃣ 构建生产版本

```bash
# 构建安装包
pnpm tauri:build

# 构建调试版本（更快，用于测试）
pnpm tauri:build:debug
```

**构建时间**: 5-15 分钟（取决于机器性能）

**产物位置**:

- **macOS**: 
  - DMG: `src-tauri/target/release/bundle/dmg/AI Chatpot_0.1.0_*.dmg`
  - App: `src-tauri/target/release/bundle/macos/AI Chatpot.app`

- **Windows**:
  - MSI: `src-tauri/target/release/bundle/msi/AI Chatpot_0.1.0_*.msi`
  - EXE: `src-tauri/target/release/ai-chatpot.exe`

- **Linux**:
  - AppImage: `src-tauri/target/release/bundle/appimage/ai-chatpot_0.1.0_*.AppImage`
  - DEB: `src-tauri/target/release/bundle/deb/ai-chatpot_0.1.0_*.deb`

---

### 3️⃣ 安装和运行

#### macOS

```bash
# 打开 DMG 文件
open src-tauri/target/release/bundle/dmg/*.dmg

# 拖拽到 Applications 文件夹
# 然后从启动台运行 "AI Chatpot"
```

#### Windows

```bash
# 双击 MSI 安装包安装
# 安装后从开始菜单启动
```

#### Linux

```bash
# AppImage（无需安装）
chmod +x src-tauri/target/release/bundle/appimage/*.AppImage
./src-tauri/target/release/bundle/appimage/*.AppImage

# DEB 包（Ubuntu/Debian）
sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb
```

---

### 4️⃣ 停止桌面应用

- **开发模式**: 在终端按 `Ctrl + C`
- **生产版本**: 关闭窗口 或 `Cmd/Ctrl + Q`

---

## 功能模块使用

### 1. 基础文本聊天

**路径**: `/`

**功能**:
- 输入文本消息
- 实时流式响应
- 停止生成按钮
- 自动上下文管理

**使用步骤**:
1. 在输入框输入消息
2. 按 `Enter` 或点击"发送"
3. 等待 AI 回复（流式显示）
4. 如需停止，点击"停止"按钮

---

### 2. 语音聊天

**路径**: `/voice`

**前置条件**:
- 浏览器支持麦克风权限
- 已配置 `OPENAI_API_KEY`（必需）
- 已配置 `ELEVENLABS_API_KEY`（可选）

**使用步骤**:
1. 访问 `/voice` 页面
2. 点击"开始录音"
3. 授予麦克风权限（首次）
4. 说话（录音中...）
5. 点击"停止录音"
6. 等待转写 → LLM 回复 → 语音合成 → 播放

**配置选项**:
- STT 模型: 固定使用 Whisper
- TTS 提供商: OpenAI / ElevenLabs
- TTS 音色: alloy, echo, fable, onyx, nova, shimmer

**故障排除**:
- 麦克风权限被拒绝：在浏览器设置中允许麦克风
- 录音无声：检查系统麦克风设置和音量
- TTS 失败：检查 API Key 是否配置正确

---

### 3. Live2D 虚拟形象

**路径**: `/avatar-chat`

**前置条件**:
- 需要 Live2D 模型文件（`.model3.json`）

**获取 Live2D 模型**:

**方式 A: 官方示例模型**
```bash
# 下载 Live2D 官方示例
# https://www.live2d.com/en/download/sample-data/
# 解压并放到 public/live2d/ 目录
```

**方式 B: 使用自定义模型**
1. 购买或制作 Live2D 模型
2. 放置在 `public/live2d/your-model/`
3. 在代码中修改模型路径

**使用步骤**:
1. 确保模型文件路径正确
2. 访问 `/avatar-chat`
3. 角色会自动加载并开始呼吸动画
4. 鼠标移动，角色眼睛会跟随
5. 聊天时，角色表情会根据情绪变化

**调试**:
- 打开浏览器控制台查看日志
- 检查 `[Live2D Manager]` 前缀的日志
- 如果模型加载失败，检查路径和文件完整性

---

### 4. 本地记忆系统

**路径**: `/memory-demo`

**功能**:
- 用户配置存储（MBTI、偏好）
- 聊天历史本地保存
- 聊天摘要生成
- 数据导出/导入

**使用步骤**:

**创建用户配置**:
1. 访问 `/memory-demo`
2. 填写用户信息（姓名、MBTI）
3. 点击"保存配置"
4. 数据保存在浏览器 IndexedDB 中

**管理聊天历史**:
1. 在"聊天历史"区域查看消息
2. 点击"添加测试消息"模拟聊天
3. 点击"清空历史"删除所有消息

**导出数据**:
1. 点击"导出数据"
2. 下载 JSON 文件到本地
3. 文件包含所有用户配置和聊天记录

**导入数据**:
1. 点击"导入数据"
2. 选择之前导出的 JSON 文件
3. 数据恢复到数据库

**桌面应用专属**:
- 在 Tauri 桌面应用中，可以直接保存到文件系统
- 数据不受浏览器清除影响

---

### 5. 用户认证

**路径**: `/signin`

**前置条件**:
- 配置邮件服务器（`EMAIL_*` 环境变量）

**登录流程**:
1. 访问 `/signin`
2. 输入邮箱地址
3. 点击"发送登录链接"
4. 检查邮箱收件箱
5. 点击邮件中的魔法链接
6. 自动登录并跳转

**注意**:
- 魔法链接有效期：10 分钟
- 每个链接只能使用一次
- 支持的邮件服务商：Gmail、SendGrid、Mailgun、SES 等

---

## 常见问题

### Q1: 启动时报错 "Missing environment variables"

**原因**: 未配置 `.env.local` 文件

**解决**:
```bash
cp env.local.example .env.local
# 编辑 .env.local，填入真实配置
```

---

### Q2: 数据库连接失败

**可能原因**:
1. Docker 未启动
2. PostgreSQL 端口被占用
3. `DATABASE_URL` 配置错误

**解决**:
```bash
# 检查 Docker 状态
docker compose ps

# 重启 Docker 容器
docker compose restart

# 检查端口占用
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows
```

---

### Q3: OpenAI API 调用失败

**可能原因**:
1. API Key 无效或过期
2. API Key 未配置
3. 网络连接问题
4. 额度用尽

**解决**:
1. 验证 API Key: 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 检查账单: 确保有可用额度
3. 在 `.env.local` 中正确配置 `OPENAI_API_KEY`
4. 重启开发服务器

**测试 API Key**:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### Q4: Tauri 编译失败

**可能原因**:
1. Rust 未安装
2. 系统依赖缺失（Linux）
3. Xcode Command Line Tools 未安装（macOS）

**解决**:

**macOS**:
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

**Windows**:
- 安装 Visual Studio C++ Build Tools
- 安装 WebView2 Runtime

---

### Q5: 麦克风权限被拒绝

**Chrome/Edge**:
1. 点击地址栏左侧的锁图标
2. 允许麦克风权限
3. 刷新页面

**Firefox**:
1. 点击地址栏左侧的图标
2. 勾选"记住此决定"
3. 选择"允许"

**Safari**:
1. Safari → 偏好设置 → 网站 → 麦克风
2. 找到 `localhost` 并允许

---

### Q6: Live2D 模型加载失败

**检查清单**:
1. 模型文件是否在 `public/live2d/` 目录
2. 路径是否正确（相对于 `public/`）
3. `.model3.json` 文件是否存在
4. 纹理和动作文件是否完整

**调试方法**:
```javascript
// 打开浏览器控制台，查看错误信息
// 检查网络请求，确认文件是否成功加载
```

---

### Q7: DuckDB 初始化失败

**浏览器兼容性**:
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 89+
- ✅ Safari 15+
- ❌ IE 不支持

**解决**:
1. 更新浏览器到最新版本
2. 检查浏览器控制台是否有 WASM 相关错误
3. 清除浏览器缓存后重试

---

## 故障排除

### 开发者工具

**浏览器控制台**:
```
按 F12 或 Cmd+Option+I (macOS) / Ctrl+Shift+I (Windows/Linux)
```

**查看网络请求**:
1. 打开开发者工具
2. 切换到"Network"标签
3. 重现问题
4. 查看失败的请求详情

**查看应用日志**:
```bash
# 终端会显示服务端日志
# 浏览器控制台显示客户端日志
```

---

### 日志说明

**日志前缀**:
- `[API_CHAT_ERROR]`: 聊天 API 错误
- `[STT]`: 语音转文字
- `[TTS]`: 文字转语音
- `[DuckDB]`: 本地数据库
- `[Live2D Manager]`: Live2D 角色
- `[Voice]`: 语音系统

**重要日志**:
```
✓ Ready in 2.3s          # Next.js 启动成功
[DuckDB] Initialization complete  # 数据库初始化成功
[Live2D Manager] Model loaded     # 模型加载成功
[STT] Transcription success       # 语音转写成功
```

---

### 重置项目

**清除所有数据（危险操作）**:

```bash
# 1. 停止所有服务
docker compose down -v

# 2. 删除 node_modules
rm -rf node_modules

# 3. 删除 .next 缓存
rm -rf .next

# 4. 删除 Tauri 构建缓存（可选）
rm -rf src-tauri/target

# 5. 重新安装
pnpm install

# 6. 重新初始化数据库
pnpm db:push
```

---

## 关闭和清理

### 正常关闭

```bash
# 1. 停止开发服务器
Ctrl + C

# 2. 停止数据库
docker compose down

# 3. 停止桌面应用（如果运行中）
关闭窗口 或 Cmd/Ctrl + Q
```

---

### 完全清理（释放磁盘空间）

```bash
# 删除 Docker 容器和卷
docker compose down -v

# 删除 Docker 镜像（可选）
docker rmi postgres:16

# 删除 node_modules（可选，约 500MB）
rm -rf node_modules

# 删除 Tauri 构建缓存（可选，约 2-5GB）
rm -rf src-tauri/target

# 删除 Next.js 构建输出
rm -rf .next out
```

---

### 数据备份

**在清理前备份重要数据**:

```bash
# 1. 导出数据库（如果使用 Docker）
docker compose exec db pg_dump -U postgres myapp > backup.sql

# 2. 导出 DuckDB 数据（访问 /memory-demo 页面点击"导出数据"）

# 3. 备份环境变量
cp .env.local .env.local.backup

# 4. 备份 Live2D 模型（如果有自定义）
cp -r public/live2d ~/Desktop/live2d-backup
```

---

## 性能优化建议

### 开发环境

1. **使用快速刷新**: Next.js 默认启用，修改代码后自动重载
2. **禁用不需要的功能**: 暂时注释掉不使用的页面路由
3. **关闭 Sourcemap**: 在 `next.config.mjs` 中添加 `productionBrowserSourceMaps: false`

### 生产环境

1. **启用 Redis 限流**: 配置 `UPSTASH_REDIS_*` 防止滥用
2. **优化数据库查询**: 定期清理旧数据
3. **CDN 加速**: 使用 Vercel Edge Network 或 Cloudflare
4. **监控性能**: 查看 Prisma 查询日志，优化慢查询

---

## 版本更新

### 检查更新

```bash
# 查看依赖更新
pnpm outdated

# 更新所有依赖到最新版本
pnpm update --latest

# 更新特定依赖
pnpm add openai@latest
```

### 迁移数据库

```bash
# 创建新迁移
pnpm db:migrate

# 应用迁移
pnpm prisma migrate deploy
```

---

## 联系和支持

- **GitHub Issues**: [提交问题](https://github.com/your-repo/issues)
- **文档首页**: [README.md](./README.md)
- **Tauri 指南**: [TAURI_DESKTOP_GUIDE.md](./TAURI_DESKTOP_GUIDE.md)
- **语音系统**: [VOICE_SYSTEM.md](./VOICE_SYSTEM.md)
- **虚拟形象**: [AVATAR_GUIDE.md](./AVATAR_GUIDE.md)
- **本地记忆**: [MEMORY_SYSTEM.md](./MEMORY_SYSTEM.md)

---

**祝你使用愉快！🎉**

