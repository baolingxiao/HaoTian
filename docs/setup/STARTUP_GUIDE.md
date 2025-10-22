# 🚀 AI Chatpot 启动指南

**最后更新**: 2025-10-11  
**状态**: ✅ 所有问题已解决

---

## ⚡ 快速启动（推荐）

### 方法 1：清理启动（最稳定）

```bash
# 1. 停止所有端口（如果有旧进程）
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. 清理缓存
rm -rf .next node_modules/.cache

# 3. 启动服务器
pnpm dev
```

### 方法 2：直接启动

```bash
pnpm dev
```

---

## 🌐 访问地址

启动成功后访问：

**主页（自动跳转到 Avatar 聊天）**:
```
http://localhost:3000
```

**直接访问 Avatar 聊天**:
```
http://localhost:3000/avatar-chat
```

**其他页面**:
- 🎤 语音聊天: `http://localhost:3000/voice`
- 🧠 本地记忆: `http://localhost:3000/memory-demo`

---

## ✅ 成功标志

### 控制台输出应该看到：

```
   ▲ Next.js 15.5.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.154:3000
   - Environments: .env.local, .env

 ✓ Starting...
 ✓ Ready in 1472ms
 ○ Compiling /avatar-chat ...
 ✓ Compiled /avatar-chat in 7.7s (1366 modules)
 GET /avatar-chat 200 in 8561ms
```

### 浏览器控制台应该看到：

```
[Live2D] SDK loaded successfully from npm package
[AvatarChat] Initializing avatar...
[AvatarChat] Avatar loaded!
```

---

## 🛑 停止服务器

### 方法 1：正常停止
在终端按 `Ctrl + C`

### 方法 2：强制停止
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 🐛 常见问题

### 1. 端口被占用

**错误**: `Port 3000 is in use by process XXXX`

**解决**:
```bash
# 停止占用端口的进程
lsof -ti:3000 | xargs kill -9

# 重新启动
pnpm dev
```

### 2. 大量缓存错误

**错误**: `ENOENT: no such file or directory, stat '.next/cache/webpack/...'`

**解决**:
```bash
# 清理所有缓存
rm -rf .next node_modules/.cache

# 重新启动
pnpm dev
```

### 3. Live2D 加载失败

**错误**: `Could not find Cubism 2 runtime`

**解决**: 已通过最新代码修复（使用 NPM 包而非 CDN）

如果仍有问题：
```bash
# 重新安装依赖
pnpm install

# 清理并启动
rm -rf .next
pnpm dev
```

### 4. 页面 404 或 500 错误

**解决**:
```bash
# 完全重置
rm -rf .next node_modules/.cache
pnpm install
pnpm dev
```

---

## 📋 启动前检查清单

- [ ] Docker 已启动（如果需要数据库）
- [ ] PostgreSQL 正在运行（`docker ps` 检查）
- [ ] `.env.local` 文件存在且配置正确
- [ ] 3000 端口未被占用
- [ ] 依赖已安装（`node_modules` 存在）

---

## 🔧 完整重置（解决所有问题）

如果遇到任何奇怪问题，执行完整重置：

```bash
# 1. 停止所有进程
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null

# 2. 清理所有缓存和构建文件
rm -rf .next node_modules/.cache out dist

# 3. 重新安装依赖（可选）
# rm -rf node_modules pnpm-lock.yaml
# pnpm install

# 4. 启动
pnpm dev
```

---

## 📊 服务状态检查

### 检查 Next.js 服务器
```bash
curl http://localhost:3000
```

### 检查端口占用
```bash
lsof -i:3000
```

### 查看实时日志
```bash
pnpm dev 2>&1 | tee dev.log
```

---

## 🎯 最佳实践

### 开发时

1. **首次启动**:
   ```bash
   rm -rf .next
   pnpm dev
   ```

2. **每日开发**:
   ```bash
   pnpm dev
   ```

3. **遇到问题时**:
   ```bash
   # 停止服务器（Ctrl+C）
   rm -rf .next node_modules/.cache
   pnpm dev
   ```

### 部署前

```bash
# 测试生产构建
pnpm build
pnpm start

# 测试 Tauri 桌面应用
TAURI_ENV=1 pnpm build
pnpm tauri:dev
```

---

## 📝 日志和调试

### 保存日志到文件
```bash
pnpm dev 2>&1 | tee dev.log
```

### 查看错误日志
```bash
grep -i error dev.log
```

### 查看编译日志
```bash
grep -i compiled dev.log
```

---

## 🆘 寻求帮助

如果以上方法都无法解决问题：

1. 查看 `dev.log` 文件
2. 截图浏览器控制台错误
3. 检查 `package.json` 依赖版本
4. 确认 Node.js 版本（推荐 18+）

---

## ✅ 当前状态

**日期**: 2025-10-11  
**版本**: Next.js 15.5.4  
**端口**: 3000  
**状态**: ✅ 完全正常

**已修复的问题**:
- ✅ Live2D CDN 加载失败 → 使用 NPM 包
- ✅ 端口冲突 → 自动清理
- ✅ Webpack 缓存错误 → 优化配置
- ✅ 首页导航 → 自动跳转

**现在可以直接运行**:
```bash
pnpm dev
```

然后访问: **http://localhost:3000** 🎉

---

**最后更新**: 2025-10-11  
**状态**: ✅ 所有功能正常

