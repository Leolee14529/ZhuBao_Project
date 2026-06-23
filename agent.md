# ZhuBao Project Agent Plan

## 1. 项目现状

- 项目路径：`/Users/leeyiscon/Documents/ZhuBao_Project`
- 当前类型：微信原生小程序前端 + 独立 Node.js/Express 后端。
- 小程序入口：`app.js`、`app.json`、`app.wxss`。
- 当前主包页面：`pages/login/index`。
- 当前业务分包：`subpackage/jewelry`、`subpackage/auth`、`subpackage/periodCalendar`、`subpackage/device12`、`subpackage/device13`、`subpackage/device17`、`subpackage/showcase`、`subpackage/showcase-device`。
- 后端入口：`backend/server.js`。
- 已有后端能力：`backend/routes/wuxing.js` 提供五行测算、保存最近一次结果、读取最近一次结果。
- 当前缺口：没有微信登录、没有真实用户体系、没有认证中间件、没有统一 request 封装、没有正式数据库。
- 当前 `backend/data/wuxing.json` 是已有五行结果数据文件；后续新增用户和 session 数据不得提交真实运行数据。

## 2. Git 基线规则

- 施工前必须先确认：
  - `pwd`
  - `ls -la`
  - `git rev-parse --show-toplevel`
  - `git status`
- 当前仓库必须先有原始 baseline commit，才能修改业务代码。
- baseline commit message 固定为：`chore: baseline imported project`。
- 项目总控文档提交 message 固定为：`chore: add project agent plan`。
- 后续每个功能分支必须从已验收的前一阶段继续，不允许跨阶段并发修改。
- 如果 `git status` 不干净，必须先判断变更来源；不得覆盖或回滚用户已有变更。

## 3. 串行分支策略

后续施工严格串行，不并发拆多个 Codex 线程施工。

1. `chore/project-baseline`
2. `feature/backend-auth-mvp`
3. `feature/frontend-login-mvp`
4. `feature/profile-user-me`
5. `feature/wuxing-user-binding`
6. `feature/request-wrapper`
7. `feature/server-deploy-prep`

每个阶段完成后必须：

- 提交当前分支。
- 给出变更文件清单。
- 给出验收命令和结果。
- 得到用户确认后再进入下一阶段。

## 4. 禁止事项

- 不修改 UI 设计。
- 不重构全项目。
- 不引入 uni-app、Taro、Vue、React。
- 不做支付、后台管理、复杂权限。
- 不做昵称头像强授权登录。
- 不把 JSON 文件当生产数据库。
- 生产环境不允许静默使用 `default` 用户。
- 后端地址不得散落硬编码在多个页面。
- 不写入微信 AppSecret、Token Secret、服务器密码或任何真实密钥。
- 不提交真实用户数据、真实 session 数据、`.env`、`node_modules`、`miniprogram_npm`。
- 未进入对应功能分支前，不允许提前实现微信登录、前端登录接入、五行接口绑定或部署配置。

## 5. 每阶段施工顺序

### 5.1 chore/project-baseline

目标：

- 建立 Git baseline。
- 创建 `.gitignore`。
- 创建本文件 `agent.md`。
- 明确后续所有施工边界。

允许修改文件：

- `.gitignore`
- `agent.md`
- Git 元数据

禁止修改文件：

- `app.js`
- `app.json`
- `pages/**`
- `subpackage/**`
- `backend/server.js`
- `backend/routes/**`
- `backend/services/**`
- `backend/middlewares/**`

验收标准：

- `git status` 可正常执行。
- `main` 上存在 `chore: baseline imported project`。
- `chore/project-baseline` 上存在 `chore: add project agent plan`。
- 没有业务代码改动。

### 5.2 feature/backend-auth-mvp

目标：

- 实现后端微信登录 MVP。
- `wx.login` 的 code 只用于后端换取 openid，并创建或更新用户。
- 登录成功不依赖昵称、头像授权。
- 生成 session/token，并提供当前用户读取能力。

允许修改文件：

- `backend/server.js`
- `backend/routes/auth.js`
- `backend/routes/users.js`
- `backend/services/wechatService.js`
- `backend/services/userStore.js`
- `backend/services/sessionStore.js`
- `backend/middlewares/authMiddleware.js`
- `backend/data/users.example.json`
- `backend/data/sessions.example.json`
- `backend/data/.gitkeep`
- `backend/README.md`
- 必要时可修改 `backend/package.json`

禁止修改文件：

- `pages/**`
- `subpackage/**`
- `app.js`
- `app.json`
- `backend/routes/wuxing.js`
- `backend/services/baziService.js`

验收标准：

- `POST /api/auth/wechat-login` 存在。
- `GET /api/users/me` 存在，并由 `backend/routes/users.js` 承载。
- `GET /api/users/me` 不允许塞进 `auth.js`。
- 缺少 code 时返回统一错误格式。
- 缺少 token 访问 `/api/users/me` 返回 401。
- `session_key` 不返回给前端。
- 路由文件不直接读写 JSON。

### 5.3 feature/frontend-login-mvp

目标：

- 登录页接入 `wx.login`。
- 调用后端 `POST /api/auth/wechat-login`。
- 登录成功后保存 token 和基础用户信息。
- 登录失败复用现有错误展示，不改 UI。

允许修改文件：

- `pages/login/index.js`
- `utils/request.js`
- `utils/config.js`

禁止修改文件：

- `pages/login/index.wxml`
- `pages/login/index.wxss`
- `subpackage/**`
- `backend/routes/**`
- `backend/services/**`

验收标准：

- 点击登录会调用 `wx.login`。
- 不要求昵称头像授权。
- 登录成功后进入首页。
- 登录失败展示 `serviceError`。
- 后端 baseURL 不散落在页面里。

### 5.4 feature/profile-user-me

目标：

- 个人中心读取真实用户。
- 退出登录清理本地登录态。

允许修改文件：

- `subpackage/jewelry/pages/settings/index.js`
- 必要时可小幅修改 `subpackage/jewelry/pages/settings/index.wxml` 以绑定真实字段
- `utils/request.js`
- `utils/config.js`

禁止修改文件：

- `subpackage/jewelry/pages/settings/index.wxss`
- `pages/login/**`
- `backend/routes/**`
- `backend/services/**`

验收标准：

- 已登录时可通过 `GET /api/users/me` 获取当前用户。
- token 失效时能回到登录页或提示重新登录。
- 退出登录会清理 token、userInfo、session 相关本地缓存。

### 5.5 feature/wuxing-user-binding

目标：

- 五行保存和读取绑定真实登录用户。
- `default` 用户只保留为本地开发兼容。

允许修改文件：

- `backend/routes/wuxing.js`
- `subpackage/jewelry/pages/five-elements/index.js`
- `subpackage/jewelry/pages/data/index.js`
- `utils/request.js`
- `utils/config.js`

默认禁止修改文件：

- `backend/services/baziService.js`

特别规则：

- 本阶段默认不要改 `backend/services/baziService.js`。
- 优先只修改 `backend/routes/wuxing.js`，通过认证中间件和路由层传入用户身份。
- 如果必须修改 `backend/services/baziService.js`，需要先说明原因并等待用户确认。
- 绝不修改五行核心算法公式。

验收标准：

- 已登录用户保存五行结果后，读取的是自己的结果。
- `NODE_ENV !== "production"` 时可以兼容 `default`。
- `NODE_ENV === "production"` 时缺少 token 必须返回 401。
- 生产环境不允许静默写入 `default` 用户。

### 5.6 feature/request-wrapper

目标：

- 统一前端请求封装和错误处理。
- 消除页面内散落的后端 baseURL。

允许修改文件：

- `utils/request.js`
- `utils/config.js`
- 已接入登录、个人中心、五行链路的页面 JS

禁止修改文件：

- 页面 WXSS 视觉样式
- 后端接口路径，除非先更新接口契约并确认

验收标准：

- `Authorization: Bearer <token>` 由 request 层统一附带。
- 成功和失败响应按统一格式处理。
- 401 能触发登录态清理或跳转登录。
- 从本地切换服务器地址时，只改 `utils/request.js` 或 `utils/config.js` 一个位置。

### 5.7 feature/server-deploy-prep

目标：

- 准备后端服务器部署说明和环境变量样例。
- 不做正式数据库迁移。

允许修改文件：

- `backend/README.md`
- `backend/package.json`
- `backend/.env.example`
- 根目录部署说明文档，若用户要求

禁止修改文件：

- 小程序页面
- 五行算法
- 认证业务逻辑
- 真实 `.env`

验收标准：

- 文档列出 `WECHAT_APPID`、`WECHAT_SECRET`、`TOKEN_SECRET`、`NODE_ENV`。
- 明确 `.env` 和 `backend/.env` 不提交。
- 明确 JSON 存储仅限本地 MVP。
- 明确生产环境必须替换为真实数据库。

## 6. 接口契约

后续新增接口：

- `POST /api/auth/wechat-login`
- `GET /api/users/me`

路由归属：

- `POST /api/auth/wechat-login` 放在 `backend/routes/auth.js`。
- `GET /api/users/me` 必须放在 `backend/routes/users.js`。
- 不要把 `/api/users/me` 塞进 `auth.js`。

微信登录请求：

```json
{
  "code": "wx.login 返回的 code"
}
```

微信登录响应：

```json
{
  "success": true,
  "data": {
    "token": "session token",
    "user": {
      "id": "user id",
      "openid": "openid",
      "unionid": null,
      "createdAt": "ISO time",
      "updatedAt": "ISO time"
    }
  }
}
```

当前用户响应：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user id",
      "openid": "openid",
      "unionid": null,
      "nickname": null,
      "avatarUrl": null,
      "createdAt": "ISO time",
      "updatedAt": "ISO time"
    }
  }
}
```

## 7. 统一响应格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

失败：

```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE"
}
```

规则：

- 新增接口必须使用统一响应格式。
- 旧五行接口如需迁移格式，必须在对应阶段单独说明兼容策略。
- 认证失败使用 401。
- 参数错误使用 400。
- 服务端异常使用 500。

## 8. 微信登录与用户资料分离原则

- `wx.login` 只负责拿 code。
- 后端通过 code 换取 openid，并创建或更新用户。
- 昵称、头像不作为登录成功的必要条件。
- 不做昵称头像强授权登录。
- 用户资料授权、资料编辑、头像昵称更新，后续单独作为 profile 功能处理。
- `session_key` 只能后端保存，不允许返回前端。

## 9. 独立 users.js 用户路由规则

- 后续允许新增 `backend/routes/users.js`。
- `GET /api/users/me` 必须由 `backend/routes/users.js` 承载。
- `backend/routes/auth.js` 只处理登录、登出、刷新 session 等认证行为。
- 用户资料读取和更新不要塞进 `auth.js`。

## 10. authMiddleware 认证中间件规则

后续允许新增：

- `backend/middlewares/authMiddleware.js`

职责：

- 解析 `Authorization: Bearer <token>`。
- 校验 session 是否存在、是否过期、是否有效。
- 查询用户。
- 挂载 `req.user`。
- 认证失败返回统一错误格式和 401。

限制：

- 中间件不直接读写 JSON 文件。
- 中间件通过 `sessionStore`、`userStore` 获取数据。

## 11. JSON 本地 MVP 存储规则

- `backend/data/users.json` 只能本地运行时生成。
- `backend/data/sessions.json` 只能本地运行时生成。
- 不应提交真实用户数据和真实 session 数据。
- 如需提交结构示例，只能提交：
  - `backend/data/users.example.json`
  - `backend/data/sessions.example.json`
  - `backend/data/.gitkeep`
- 所有 JSON 读写必须集中在 service/store 层。
- 路由文件不得直接读写 JSON。
- 后续切换 MySQL/PostgreSQL/SQLite 时，应尽量只替换 store 层。
- JSON 文件不能作为生产数据库。

## 12. default 用户仅本地开发兼容规则

- `default` 用户只用于本地开发兼容旧五行链路。
- `NODE_ENV !== "production"` 时，可以兼容 `default`。
- `NODE_ENV === "production"` 时，缺少 token 必须返回 401。
- 生产环境不允许静默读取或写入 `default` 用户。
- 任何新接口不得默认把真实用户数据写到 `default`。

## 13. 前端 baseURL 集中配置规则

- 不允许在多个页面里散落硬编码 baseURL。
- 后端地址必须集中在：
  - `utils/request.js`
  - 或 `utils/config.js`
- 项目从本地后端切换到服务器时，只能改一个位置。
- 页面文件只调用 request 方法，不直接拼接完整后端地址。

## 14. .gitignore 规则

必须忽略：

- `.env`
- `backend/.env`
- `node_modules/`
- `backend/node_modules/`
- `miniprogram_npm/`
- `backend/data/users.json`
- `backend/data/sessions.json`
- 本地日志、临时文件、缓存目录、构建产物

禁止提交：

- 微信 AppSecret
- Token Secret
- 服务器密码
- 真实用户数据
- 真实 session 数据
- 依赖目录

## 15. 服务器部署后置规则

- 服务器部署准备放在最后阶段 `feature/server-deploy-prep`。
- 在登录、用户、五行绑定链路跑通前，不做部署施工。
- 部署阶段只准备环境变量、启动方式、README 和必要脚本。
- 不在仓库中写入真实服务器密码或真实密钥。
- 生产环境必须使用正式数据库替换 JSON store。

## 16. 每阶段验收标准

通用验收：

- `git status` 必须干净，或只保留已说明的未提交文件。
- 输出本阶段变更文件清单。
- 输出本阶段测试或验证命令。
- 明确是否修改了禁止文件。
- 明确是否引入敏感数据。

后端认证验收：

- 登录接口参数错误能返回统一错误。
- `/api/users/me` 缺 token 返回 401。
- token 有效时能返回当前用户。
- `session_key` 不返回前端。

前端登录验收：

- 登录按钮触发 `wx.login`。
- 登录接口成功后进入首页。
- 登录失败显示错误。
- baseURL 没有散落硬编码。

个人中心验收：

- 已登录能读取真实用户。
- token 失效能回登录页或提示重新登录。
- 退出登录清理本地登录态。

五行绑定验收：

- 保存和读取绑定当前登录用户。
- 本地开发兼容 `default`。
- 生产环境未登录返回 401。
- 未修改五行核心算法公式。

部署准备验收：

- README 说明环境变量和启动方式。
- `.env` 不提交。
- JSON store 的生产风险写清楚。
