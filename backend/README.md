# ZhuBao 后端

Node.js + Express 后端，提供微信登录、用户会话和五行计算服务。

## 运行要求

- Node.js 24 LTS
- pnpm 10
- PostgreSQL 17 或兼容版本

## 本地启动

```bash
cd backend
cp .env.example .env
pnpm install --frozen-lockfile
```

当前项目不自动加载 `.env`，开发时通过 shell 注入：

```bash
DATABASE_URL=postgresql:///zhubao_dev pnpm run db:migrate
DATABASE_URL=postgresql:///zhubao_dev pnpm run dev
```

未配置 `DATABASE_URL` 时，非生产环境使用临时 JSON 存储。JSON 模式只用于本地调试，不允许用于生产。

## 生产环境变量

| 变量 | 必填 | 说明 |
|---|---:|---|
| `NODE_ENV=production` | 是 | 启用生产校验 |
| `PORT` | 否 | 默认 `3000` |
| `DATABASE_URL` | 是 | PostgreSQL 连接地址 |
| `DATABASE_SSL` | 否 | 托管数据库需要时设为 `true` |
| `WECHAT_APPID` | 是 | 微信小程序 AppID |
| `WECHAT_SECRET` | 是 | 微信 AppSecret |
| `CORS_ORIGINS` | 否 | 浏览器来源白名单，逗号分隔 |

生产启动会拒绝缺少数据库或微信密钥的配置。真实密钥不得写入仓库。

## 数据库

执行迁移：

```bash
DATABASE_URL=postgresql://user:password@host:5432/zhubao pnpm run db:migrate
```

当前表：

- `users`
- `auth_sessions`
- `birth_profiles`
- `wuxing_results`
- `schema_migrations`

五行结果记录 `algorithm_version`，便于算法升级后的结果追踪。删除用户时，其 session、出生资料和结果通过外键级联删除。

## API

所有接口统一响应：

```json
{
  "success": true,
  "data": {}
}
```

错误：

```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE",
  "requestId": "请求追踪 ID"
}
```

### 健康检查

- `GET /health/live`
- `GET /health/ready`

### 认证

- `POST /api/auth/wechat-login`
- `POST /api/auth/account-register`
- `POST /api/auth/account-login`
- `POST /api/auth/logout`
- `GET /api/users/me`

除登录外，认证接口使用：

```text
Authorization: Bearer <token>
```

token 只以 SHA-256 哈希形式存储。退出登录会撤销当前 session。

账号密码登录使用同一套用户和 session 体系。注册和登录请求体一致：

```json
{
  "accountName": "user@example.com",
  "password": "Passw0rd!2026"
}
```

后端只保存密码哈希，不保存明文密码；账号名会统一转为小写。

### 灵签

- `GET /api/fortunes/random`

当前从后端灵签池随机返回一条，支持 `previousId` 查询参数避免连续重复。后续可在 `backend/services/fortuneService.js` 内替换为数据库或运营配置来源。

### 五行

- `POST /api/wuxing/calculate`
- `POST /api/wuxing/save`
- `GET /api/wuxing/latest`

三个接口均要求登录。服务器只使用 token 对应的 `userId`，忽略客户端提交或查询的 `userId`。

请求体：

```json
{
  "birthDate": "2003-12-09",
  "birthTime": "10:30",
  "gender": "female"
}
```

## 验证

```bash
pnpm run check:syntax
pnpm test
pnpm run check:lines
pnpm audit --prod
```

`check:lines` 会扫描项目的 JS、WXML、WXSS，单文件不得超过 300 行。

## 部署顺序

1. 配置 PostgreSQL 和备份策略。
2. 注入生产环境变量。
3. 执行 `pnpm install --frozen-lockfile`。
4. 执行数据库迁移。
5. 启动服务并检查 `/health/live`、`/health/ready`。
6. 配置 HTTPS 反向代理和微信请求域名。
7. 小流量验证登录、五行保存、读取、退出。

服务支持 `SIGTERM`、`SIGINT` 优雅关闭。生产环境应由容器平台或进程管理器负责重启与日志采集。
