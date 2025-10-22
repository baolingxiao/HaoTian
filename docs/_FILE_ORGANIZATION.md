# 📚 文档组织结构

**创建时间**: 2025-10-11  
**目的**: 整理项目文档，便于查找和维护

---

## 📁 目录结构

```
docs/
├── setup/              # 安装和配置指南
├── features/           # 功能说明文档
├── troubleshooting/    # 问题排查和修复
└── archives/           # 历史文档（已过时但保留）
```

---

## 📋 文件分类

### 📦 Setup（安装配置）
- `STARTUP_GUIDE.md` - 启动指南
- `TAURI_DESKTOP_GUIDE.md` - Tauri 桌面应用
- `DATABASE_CHANGE_GUIDE.md` - 数据库配置
- `health-check.sh` - 健康检查脚本
- `setup.sh` - 初始化脚本
- `tauri-setup.sh` - Tauri 安装脚本

### 🎭 Features（功能文档）
- `AVATAR_GUIDE.md` - Avatar 功能指南
- `VOICE_SYSTEM.md` - 语音系统
- `MEMORY_SYSTEM.md` - 本地记忆系统
- `NAVIGATION_UPDATE.md` - 导航系统更新
- `LIVE2D_SETUP_GUIDE.md` - Live2D 设置
- `setup-avatar.sh` - Avatar 设置脚本
- `download-live2d-model.sh` - 下载模型脚本

### 🐛 Troubleshooting（问题排查）
- `LIVE2D_COMPLETE_SOLUTION.md` - Live2D 完整解决方案（最新）
- `TROUBLESHOOTING_AVATAR.md` - Avatar 问题排查
- `LIVE2D_FINAL_FIX.md` - Live2D 最终修复
- `LIVE2D_CDN_FIX.md` - Live2D CDN 修复
- `LIVE2D_FIX.md` - Live2D 基础修复

### 📜 Archives（历史文档）
- `CHANGELOG_DATABASE.md` - 数据库变更日志
- `LIVE2D_STATUS.md` - Live2D 状态（已过时）
- `SUMMARY.md` - 项目总结
- `PROJECT_STATUS.md` - 项目状态报告

### 📖 Root（根目录保留）
- `README.md` - 项目主文档
- `USER_MANUAL.md` - 用户手册

---

## 🔍 快速查找

### 我想启动项目
→ `README.md` 或 `docs/setup/STARTUP_GUIDE.md`

### 我遇到 Live2D 错误
→ `docs/troubleshooting/LIVE2D_COMPLETE_SOLUTION.md`

### 我想添加语音功能
→ `docs/features/VOICE_SYSTEM.md`

### 我想配置数据库
→ `docs/setup/DATABASE_CHANGE_GUIDE.md`

### 我想打包桌面应用
→ `docs/setup/TAURI_DESKTOP_GUIDE.md`

---

## ✅ 文档状态

| 文档 | 状态 | 说明 |
|------|------|------|
| LIVE2D_COMPLETE_SOLUTION.md | ✅ 最新 | Live2D 的最终可用方案 |
| STARTUP_GUIDE.md | ✅ 最新 | 项目启动指南 |
| README.md | ✅ 最新 | 项目主文档 |
| USER_MANUAL.md | ✅ 最新 | 用户手册 |
| LIVE2D_STATUS.md | ⚠️ 已过时 | 已归档 |
| SUMMARY.md | ⚠️ 已过时 | 已归档 |

---

**最后更新**: 2025-10-11
