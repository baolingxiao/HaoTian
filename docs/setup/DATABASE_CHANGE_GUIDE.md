# 📝 DATABASE_URL 修改指南

## 🔄 修改场景和对应操作

### 场景 1: 修改为云端数据库

**示例**：从本地 Docker 改为 Neon/Supabase/Railway

```env
# 修改前（本地 Docker）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp?schema=public

# 修改后（云端数据库）
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**需要执行的步骤**：

```bash
# 1. 重新生成 Prisma 客户端
pnpm db:generate

# 2. 推送数据库 schema（会创建表）
pnpm db:push

# 3. 重启开发服务器（如果正在运行）
# 先按 Ctrl+C 停止
pnpm dev
```

**注意事项**：
- ✅ 云端数据库通常需要 `sslmode=require` 参数
- ✅ 确保云端数据库防火墙允许你的 IP
- ⚠️ 本地数据的数据不会自动迁移，需要手动导出/导入

---

### 场景 2: 修改数据库名称

**示例**：从 `myapp` 改为 `chatbot`

```env
# 修改前
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp?schema=public

# 修改后
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot?schema=public
```

**需要执行的步骤**：

```bash
# 1. 在 Docker 中创建新数据库
docker compose exec db psql -U postgres -c "CREATE DATABASE chatbot;"

# 2. 推送 schema 到新数据库
pnpm db:push

# 3. 重启开发服务器
pnpm dev
```

**或者修改 docker-compose.yml**：

```yaml
services:
  db:
    environment:
      POSTGRES_DB: chatbot  # 改为新名称
```

然后重新创建容器：
```bash
docker compose down -v
docker compose up -d
pnpm db:push
```

---

### 场景 3: 修改端口

**示例**：从 `5432` 改为 `5433`（端口冲突时）

```env
# 修改前
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp?schema=public

# 修改后
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/myapp?schema=public
```

**需要执行的步骤**：

1. 修改 `docker-compose.yml`：
```yaml
services:
  db:
    ports: ["5433:5432"]  # 主机端口:容器端口
```

2. 重启容器：
```bash
docker compose down
docker compose up -d
```

3. 重启开发服务器：
```bash
pnpm dev
```

---

### 场景 4: 修改用户名和密码

**示例**：更安全的凭证

```env
# 修改前
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp?schema=public

# 修改后
DATABASE_URL=postgresql://admin:SecurePass123@localhost:5432/myapp?schema=public
```

**需要执行的步骤**：

1. 修改 `docker-compose.yml`：
```yaml
services:
  db:
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: SecurePass123
      POSTGRES_DB: myapp
```

2. 重新创建容器（会清除旧数据）：
```bash
docker compose down -v
docker compose up -d
```

3. 推送 schema：
```bash
pnpm db:push
```

---

## 🔧 通用修改流程

无论你修改了什么，**标准流程**：

```bash
# 1. 停止开发服务器（如果正在运行）
Ctrl + C

# 2. 如果是本地 Docker，重启容器
docker compose down
docker compose up -d

# 3. 重新生成 Prisma 客户端
pnpm db:generate

# 4. 推送或迁移数据库 schema
pnpm db:push        # 开发环境（快速）
# 或
pnpm db:migrate     # 生产环境（创建迁移历史）

# 5. 重启开发服务器
pnpm dev
```

---

## 🧪 测试连接

修改后测试数据库连接：

```bash
# 方法 1: 使用 Prisma Studio
pnpm prisma studio

# 方法 2: 直接连接数据库
# Docker 本地
docker compose exec db psql -U postgres -d myapp

# 云端数据库
psql "postgresql://user:password@host:port/database?sslmode=require"
```

---

## ⚠️ 常见问题

### Q1: 修改后报错 "Can't reach database server"

**原因**：
- Docker 容器未启动
- 端口配置错误
- 主机名错误
- 防火墙阻止连接

**解决**：
```bash
# 检查 Docker 状态
docker compose ps

# 检查端口占用
lsof -i :5432

# 重启容器
docker compose restart

# 查看日志
docker compose logs db
```

### Q2: 修改后报错 "P1001: Can't reach database server at host:port"

**原因**：可能是 SSL 配置问题（云端数据库）

**解决**：
```env
# 添加 sslmode 参数
DATABASE_URL=postgresql://...?sslmode=require
```

### Q3: 数据丢失了

**原因**：运行了 `docker compose down -v`（删除了卷）

**解决**：
- 恢复备份（如果有）
- 重新运行 `pnpm db:push` 创建表结构

**预防措施**：
```bash
# 定期备份数据
docker compose exec db pg_dump -U postgres myapp > backup.sql

# 恢复数据
docker compose exec -T db psql -U postgres myapp < backup.sql
```

### Q4: 如何在不丢失数据的情况下修改配置？

**方法 1**：导出数据
```bash
# 1. 导出数据
docker compose exec db pg_dump -U postgres myapp > backup.sql

# 2. 修改配置并重启
docker compose down -v
# 修改 .env.local 和 docker-compose.yml
docker compose up -d

# 3. 推送 schema
pnpm db:push

# 4. 导入数据
docker compose exec -T db psql -U postgres myapp < backup.sql
```

**方法 2**：使用 Prisma Migrate（推荐生产环境）
```bash
# 1. 创建迁移
pnpm prisma migrate dev --name change_config

# 2. 应用迁移
pnpm prisma migrate deploy
```

---

## 📋 修改检查清单

修改 `DATABASE_URL` 后，请检查：

- [ ] `.env.local` 已更新
- [ ] `docker-compose.yml` 已更新（如果使用 Docker）
- [ ] Docker 容器已重启
- [ ] 运行了 `pnpm db:generate`
- [ ] 运行了 `pnpm db:push` 或 `pnpm db:migrate`
- [ ] 开发服务器已重启
- [ ] 可以访问 `http://localhost:3000`
- [ ] 聊天功能正常
- [ ] 数据库连接正常（可用 Prisma Studio 验证）

---

## 🔗 相关命令速查

```bash
# 数据库相关
pnpm db:generate          # 生成 Prisma 客户端
pnpm db:push              # 推送 schema（开发环境）
pnpm db:migrate           # 创建迁移（生产环境）
pnpm prisma studio        # 打开数据库管理界面

# Docker 相关
docker compose up -d      # 启动容器
docker compose down       # 停止容器
docker compose down -v    # 停止容器并删除数据
docker compose ps         # 查看容器状态
docker compose logs db    # 查看数据库日志
docker compose restart    # 重启容器

# 数据备份恢复
docker compose exec db pg_dump -U postgres myapp > backup.sql
docker compose exec -T db psql -U postgres myapp < backup.sql
```

---

## 📖 更多帮助

- **Prisma 文档**: https://www.prisma.io/docs
- **PostgreSQL 文档**: https://www.postgresql.org/docs/
- **项目使用手册**: [USER_MANUAL.md](./USER_MANUAL.md)

---

**最后更新**: 2025-10-11

