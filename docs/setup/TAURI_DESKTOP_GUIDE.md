# 🖥️ Tauri 桌面应用指南

## 📋 概述

本指南介绍如何将 Next.js Web 应用打包为 Tauri 桌面应用，实现类似 AIRI Stage Tamagotchi 的桌面体验。

### 为什么使用 Tauri？

- **轻量级**: 比 Electron 更小的包体积（~3MB vs ~100MB）
- **原生性能**: 使用系统原生 WebView，资源占用更少
- **安全性**: Rust 后端，内存安全保证
- **跨平台**: 支持 macOS、Windows、Linux
- **本地文件系统**: 完整的文件系统访问权限
- **更好的隐私**: 数据完全存储在本地

---

## 🏗️ 架构说明

```
┌─────────────────────────────────────────┐
│          Tauri Desktop App              │
├─────────────────────────────────────────┤
│  Frontend (Next.js Static Export)       │
│  - React UI Components                  │
│  - Voice Chat (useVoice)                │
│  - Live2D Avatar (AvatarStage)          │
│  - Local Memory (DuckDB WASM)           │
├─────────────────────────────────────────┤
│  Tauri Plugins                          │
│  - File System (tauri-plugin-fs)        │
│  - Store (tauri-plugin-store)           │
│  - Dialog (tauri-plugin-dialog)         │
├─────────────────────────────────────────┤
│  Rust Backend                           │
│  - System Integration                   │
│  - Native File Operations               │
│  - Security & Permissions               │
└─────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 前置条件

1. **Rust 开发环境**（必需）

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 验证安装
rustc --version
cargo --version
```

2. **系统依赖**

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Windows:**
- 安装 [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- 安装 [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

---

## 📦 项目结构

```
AI_Chatpot/
├── src/                    # Next.js 前端代码
│   ├── app/               # App Router 页面
│   ├── components/        # React 组件
│   ├── hooks/             # React Hooks (useVoice, useMemory, useAvatar)
│   └── lib/               
│       ├── tauri-store.ts # Tauri 存储封装
│       └── memory/        # DuckDB WASM 本地数据库
├── src-tauri/             # Tauri 后端（Rust）
│   ├── src/
│   │   ├── main.rs        # 应用入口
│   │   └── lib.rs         # Tauri 命令
│   ├── icons/             # 应用图标
│   ├── Cargo.toml         # Rust 依赖
│   ├── tauri.conf.json    # Tauri 配置
│   └── build.rs           # 构建脚本
├── out/                   # Next.js 静态导出输出（构建时生成）
└── package.json           # Node.js 依赖
```

---

## 🛠️ 开发流程

### 1. 开发模式（推荐）

**方式 A: Tauri Dev（一键启动）**

```bash
pnpm tauri:dev
```

这个命令会：
1. 启动 Next.js 开发服务器（`localhost:3000`）
2. 启动 Tauri 窗口，加载 Next.js 应用
3. 自动热重载（前端和 Rust 代码）

**方式 B: 分离模式（调试）**

终端 1 - 启动 Next.js:
```bash
pnpm dev
```

终端 2 - 启动 Tauri:
```bash
pnpm tauri dev
```

### 2. 构建生产版本

```bash
# 构建桌面应用
pnpm tauri:build

# 构建调试版本（更快，用于测试）
pnpm tauri:build:debug
```

构建产物位置：
- **macOS**: `src-tauri/target/release/bundle/dmg/AI Chatpot_0.1.0_*.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/AI Chatpot_0.1.0_*.msi`
- **Linux**: `src-tauri/target/release/bundle/appimage/ai-chatpot_0.1.0_*.AppImage`

---

## 🔧 配置说明

### 1. Tauri 配置 (`src-tauri/tauri.conf.json`)

```json
{
  "productName": "AI Chatpot",         // 应用名称
  "version": "0.1.0",                  // 版本号
  "identifier": "com.aichatpot.app",   // Bundle ID（唯一标识）
  "build": {
    "beforeDevCommand": "pnpm dev",    // 开发前执行
    "devUrl": "http://localhost:3000", // 开发 URL
    "beforeBuildCommand": "pnpm build",// 构建前执行
    "frontendDist": "../out"           // 静态文件目录
  },
  "app": {
    "windows": [{
      "title": "AI Chatpot",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600,
      "resizable": true,
      "center": true
    }]
  },
  "plugins": {
    "fs": {                             // 文件系统权限
      "scope": ["$APPDATA", "$APPDATA/**"]
    },
    "store": {                          // 键值存储权限
      "scope": ["$APPDATA/**"]
    },
    "dialog": {                         // 对话框权限
      "open": true,
      "save": true
    }
  }
}
```

### 2. Next.js 配置 (`next.config.mjs`)

```javascript
const nextConfig = {
  // 对于 Tauri，我们需要静态导出
  output: process.env.TAURI_ENV ? 'export' : undefined,
  
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
};
```

### 3. 应用图标

Tauri 需要多尺寸图标，放置在 `src-tauri/icons/`:

- `32x32.png` - 小图标
- `128x128.png` - 中图标
- `128x128@2x.png` - Retina 图标
- `icon.icns` - macOS 图标
- `icon.ico` - Windows 图标

**生成图标:**

```bash
# 使用 Tauri 图标生成工具
pnpm tauri icon path/to/your-icon.png
```

---

## 💾 本地数据持久化

### 1. Tauri Store（键值存储）

用于存储简单的配置和设置：

```typescript
import { storage } from '@/lib/tauri-store';

// 保存数据
await storage.set('user_theme', 'dark');

// 读取数据
const theme = await storage.get<string>('user_theme');

// 删除数据
await storage.remove('user_theme');

// 清空所有数据
await storage.clear();
```

**存储位置:**
- **macOS**: `~/Library/Application Support/com.aichatpot.app/`
- **Windows**: `%APPDATA%\com.aichatpot.app\`
- **Linux**: `~/.config/com.aichatpot.app/`

### 2. DuckDB WASM（结构化数据）

用于存储聊天记录、用户配置、MBTI 数据：

```typescript
import { useMemory } from '@/hooks/useMemory';

function MyComponent() {
  const memory = useMemory();
  
  // 保存用户配置
  await memory.saveProfile({
    id: 'user-1',
    name: 'Alice',
    mbti: 'INFJ',
    preferences: { theme: 'dark', language: 'zh-CN' }
  });
  
  // 查询聊天历史
  const messages = await memory.getMessages('chat-123');
  
  // 导出数据到文件（Tauri 专属）
  await memory.exportToFile('backup.json');
}
```

**存储位置:**
- 数据保存在浏览器的 IndexedDB 中
- 在 Tauri 环境中，可以导出到本地文件系统

### 3. 文件系统操作

直接读写文件：

```typescript
import { fileSystem } from '@/lib/tauri-store';

// 读取文件
const content = await fileSystem.readText('path/to/file.txt');

// 写入文件
await fileSystem.writeText('path/to/file.txt', 'Hello, Tauri!');

// 检查文件是否存在
const exists = await fileSystem.exists('path/to/file.txt');

// 删除文件
await fileSystem.remove('path/to/file.txt');
```

---

## 🎨 桌面特性

### 1. 窗口控制

```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// 最小化
await appWindow.minimize();

// 最大化/还原
await appWindow.toggleMaximize();

// 关闭窗口
await appWindow.close();

// 设置窗口大小
await appWindow.setSize({ width: 1000, height: 600 });

// 设置窗口标题
await appWindow.setTitle('New Title');

// 始终置顶
await appWindow.setAlwaysOnTop(true);
```

### 2. 系统托盘（可选）

在 `tauri.conf.json` 中启用：

```json
{
  "app": {
    "trayIcon": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true,
      "menuOnLeftClick": false
    }
  }
}
```

### 3. 通知

```typescript
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

// 请求权限
let permissionGranted = await isPermissionGranted();
if (!permissionGranted) {
  const permission = await requestPermission();
  permissionGranted = permission === 'granted';
}

// 发送通知
if (permissionGranted) {
  sendNotification({
    title: 'AI Chatpot',
    body: '你有新消息！'
  });
}
```

---

## 🔐 安全性

### 1. 权限管理

Tauri 使用白名单机制，所有 API 调用必须在 `tauri.conf.json` 中声明：

```json
{
  "plugins": {
    "fs": {
      "scope": ["$APPDATA/**"]  // 只允许访问应用数据目录
    }
  }
}
```

### 2. CSP（内容安全策略）

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://api.openai.com"
    }
  }
}
```

### 3. 环境变量

**在桌面应用中使用环境变量：**

1. 在 `.env.local` 中定义
2. 构建时会被打包进应用
3. **注意**: 不要在客户端代码中直接使用敏感 API Key

**推荐做法：**
- API Key 等敏感信息应该通过本地服务器（如 Next.js API Routes）中转
- 或者使用 Tauri 的 Rust 后端处理

---

## 🚢 发布流程

### 1. 版本管理

更新 `src-tauri/tauri.conf.json`:

```json
{
  "version": "0.2.0"  // 遵循语义化版本
}

```

### 2. 代码签名（生产必需）

**macOS:**
```bash
# 需要 Apple Developer 账号
# 在 tauri.conf.json 中配置
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

**Windows:**
```bash
# 需要代码签名证书
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT"
    }
  }
}
```

### 3. 自动更新（可选）

安装 Tauri Updater:

```bash
pnpm add @tauri-apps/plugin-updater
```

配置 `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://yourdomain.com/updates/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

---

## 📊 性能优化

### 1. 减小包体积

- 使用 `output: 'export'` 生成静态文件
- 移除不必要的依赖
- 优化图片和资源

### 2. 启动优化

在 `tauri.conf.json` 中：

```json
{
  "build": {
    "beforeBuildCommand": "pnpm build && pnpm optimize"
  }
}
```

### 3. 内存管理

```typescript
// 使用完毕后清理大对象
useEffect(() => {
  return () => {
    // 清理逻辑
  };
}, []);
```

---

## 🐛 调试技巧

### 1. 开发者工具

开发模式下自动打开（见 `src-tauri/src/main.rs`）：

```rust
#[cfg(debug_assertions)]
{
    let window = app.get_webview_window("main").unwrap();
    window.open_devtools();
}
```

### 2. Rust 日志

```rust
println!("Debug info: {:?}", some_variable);
```

日志输出在终端中。

### 3. 前端调试

使用 Chrome DevTools，就像调试 Web 应用一样。

---

## 📱 与 AIRI Stage Tamagotchi 的对比

| 特性 | AIRI | 我们的实现 |
|------|------|-----------|
| 框架 | Tauri + Vue | Tauri + Next.js + React |
| Live2D 角色 | ✅ | ✅ (pixi-live2d-display) |
| 语音对话 | ✅ | ✅ (useVoice hook) |
| 本地记忆 | ✅ | ✅ (DuckDB WASM) |
| 桌面窗口 | ✅ | ✅ |
| 系统托盘 | ✅ | ⚙️ (可配置) |
| 自动更新 | ✅ | ⚙️ (可配置) |

---

## 🔗 常见问题

### Q: 为什么选择 Tauri 而不是 Electron？

A: Tauri 更轻量（~3MB vs ~100MB），性能更好，安全性更高，且使用 Rust 后端。

### Q: 我的 API 路由在桌面应用中不工作？

A: 使用静态导出时，Next.js API Routes 不可用。你需要：
1. 使用 Tauri 的 Rust 后端处理 API 请求
2. 或者在客户端直接调用外部 API（不推荐暴露 API Key）

### Q: 如何在开发和生产环境中区分？

A: 使用环境变量：

```typescript
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
const isDev = process.env.NODE_ENV === 'development';
```

### Q: 数据存储在哪里？

A: 
- Tauri Store: `$APPDATA/com.aichatpot.app/`
- DuckDB WASM: 浏览器 IndexedDB（可导出到文件）

### Q: 如何更新应用？

A: 
1. 手动：用户下载新版本安装包
2. 自动：配置 Tauri Updater 插件

---

## 📚 参考资源

- [Tauri 官方文档](https://tauri.app/)
- [Tauri + Next.js 指南](https://tauri.app/develop/integrate-with-nextjs/)
- [AIRI 开源项目](https://github.com/moeru-ai/airi)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

## 🎉 快速命令参考

```bash
# 开发
pnpm tauri:dev              # 启动 Tauri 开发模式
pnpm dev                    # 仅启动 Next.js（浏览器）

# 构建
pnpm tauri:build            # 构建生产版本
pnpm tauri:build:debug      # 构建调试版本

# Tauri CLI
pnpm tauri info             # 查看环境信息
pnpm tauri icon <path>      # 生成应用图标
pnpm tauri plugin add <name># 添加插件
```

---

## 💡 最佳实践

1. **分离逻辑**: 将 Tauri 特定代码封装在 `lib/tauri-*.ts` 中，提供降级方案
2. **环境检测**: 始终检查 `isTauriEnv()` 再调用 Tauri API
3. **错误处理**: Tauri API 调用可能失败，务必使用 try-catch
4. **性能监控**: 使用 Chrome DevTools 分析性能
5. **安全第一**: 不要在客户端暴露敏感 API Key

---

**享受桌面应用开发！🚀**

