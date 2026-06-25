# 五行定制后端

这是一个独立的 Node.js + Express 后端，当前提供五行定制接口和微信登录 MVP 接口。

四柱八字和五行计算全部在本地完成。微信登录只用于通过 `wx.login` 的 code 换取 openid，并创建本地 MVP 用户与 session。

## 安装步骤

```bash
npm install
npm run dev
```

微信登录接口需要通过 shell 注入环境变量。本阶段不使用 `dotenv`，不要把真实 AppSecret 写入任何文件。本地启动可以使用：

```bash
WECHAT_APPID=xxx WECHAT_SECRET=xxx npm run dev
```

或：

```bash
WECHAT_APPID=xxx WECHAT_APP_SECRET=xxx npm run dev
```

服务默认地址：

```text
http://localhost:3000
```

## 目录结构

```text
backend/
├─ server.js
├─ package.json
├─ middlewares/
│  └─ authMiddleware.js
├─ routes/
│  ├─ auth.js
│  ├─ users.js
│  └─ wuxing.js
├─ services/
│  ├─ sessionStore.js
│  ├─ userStore.js
│  ├─ wechatService.js
│  └─ baziService.js
├─ data/
│  ├─ sessions.example.json
│  ├─ users.example.json
│  └─ wuxing.json
└─ README.md
```

## 认证接口

### 1. 微信登录

`POST /api/auth/wechat-login`

请求示例：

```json
{
  "code": "wx.login 返回的 code"
}
```

成功返回：

```json
{
  "success": true,
  "data": {
    "token": "opaque-session-token",
    "user": {
      "id": "usr_xxx",
      "openid": "openid_xxx",
      "unionid": null,
      "nickname": null,
      "avatarUrl": null,
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    }
  }
}
```

说明：

- 登录成功只依赖 openid，不强制昵称或头像授权。
- `session_key` 只允许后端保存，不返回前端。
- 前端拿到的是 opaque token，后端只保存 `sha256` 后的 `tokenHash`。

### 2. 当前用户

`GET /api/users/me`

请求头：

```text
Authorization: Bearer <token>
```

成功返回：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_xxx",
      "openid": "openid_xxx",
      "unionid": null,
      "nickname": null,
      "avatarUrl": null,
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    }
  }
}
```

## 认证错误格式

新增认证接口统一返回下面的错误格式：

```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE"
}
```

当前错误码包括：

- `AUTH_CODE_REQUIRED`
- `WECHAT_CONFIG_MISSING`
- `WECHAT_CODE2SESSION_FAILED`
- `WECHAT_OPENID_MISSING`
- `AUTH_TOKEN_REQUIRED`
- `AUTH_TOKEN_INVALID`
- `AUTH_TOKEN_EXPIRED`
- `USER_NOT_FOUND`
- `INTERNAL_ERROR`

## 本地 MVP 数据存储

- `data/users.json` 和 `data/sessions.json` 只允许本地运行时生成，不提交 Git。
- 如需查看结构，只参考 `data/users.example.json` 和 `data/sessions.example.json`。
- 路由文件不得直接读写 JSON，用户和 session 读写集中在 `services/userStore.js` 与 `services/sessionStore.js`。
- JSON 文件不能作为生产数据库。后续切换 MySQL/PostgreSQL/SQLite 时，应尽量只替换 store 层。

## 计算说明

- 参考 `junglesta/BAZI` 的本地四柱算法
- 使用太阳黄经和节气索引计算年柱、月柱
- 使用儒略日计算日柱
- 使用日干推时干，计算时柱
- 再统计四柱天干地支对应的五行
- `elements` 返回五行占比，百分比总和固定为 `100`
- 当前接口默认按中国时区 `UTC+8` 计算

## 接口说明

### 1. 计算五行

`POST /api/wuxing/calculate`

请求示例：

```json
{
  "birthDate": "2003-12-09",
  "birthTime": "10:30",
  "gender": "female"
}
```

返回示例：

```json
{
  "userId": "default",
  "birthDate": "2003-12-09",
  "birthTime": "10:30",
  "gender": "female",
  "bazi": {
    "year": "癸未",
    "month": "壬子",
    "day": "乙卯",
    "hour": "辛巳"
  },
  "elements": {
    "wood": 25,
    "fire": 13,
    "earth": 13,
    "metal": 12,
    "water": 37
  },
  "dominant": "水",
  "analysis": "水元素偏强，整体感受力较细腻，适应变化能力较好，气质偏柔和流动。",
  "suggestion": "适合蓝色、黑色系珠宝，可优先考虑海蓝宝、青金石、黑曜石等偏水属性搭配。",
  "raw": {
    "stems": [],
    "branches": [],
    "counts": {
      "wood": 1,
      "fire": 2,
      "earth": 2,
      "metal": 1,
      "water": 2
    },
    "solarTerm": {
      "index": 20,
      "longitude": 255,
      "name_cn": "大雪",
      "name_en": "Major Snow",
      "name_pinyin": "Daxue"
    },
    "sunLongitude": 256.251,
    "julianDay": 2452982.271,
    "timezone": "UTC+8"
  }
}
```

### 2. 保存最近一次计算结果

`POST /api/wuxing/save`

请求示例：

```json
{
  "userId": "default",
  "birthDate": "2003-12-09",
  "birthTime": "10:30",
  "gender": "female"
}
```

说明：

- 该接口会先重新计算一次，再把结果保存到 `data/wuxing.json`
- 如果不传 `userId`，默认使用 `default`

### 3. 读取最近一次计算结果

`GET /api/wuxing/latest?userId=default`

## PowerShell 测试示例

### 计算五行

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/wuxing/calculate" `
  -ContentType "application/json" `
  -Body '{"birthDate":"2003-12-09","birthTime":"10:30","gender":"female"}'
```

### 保存最近一次结果

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/wuxing/save" `
  -ContentType "application/json" `
  -Body '{"userId":"default","birthDate":"2003-12-09","birthTime":"10:30","gender":"female"}'
```

### 读取最近一次结果

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/wuxing/latest?userId=default"
```

## 参数校验

- 缺少 `birthDate` 返回 `400`
- 缺少 `birthTime` 返回 `400`
- 缺少 `gender` 返回 `400`
- `birthDate` 必须使用 `YYYY-MM-DD`
- `birthTime` 必须使用 `HH:mm`
- `gender` 只能是 `male` 或 `female`

## 微信小程序对接方式

前端建议按下面顺序调用：

1. 用户填写出生日期、出生时间、性别
2. 调用 `POST /api/wuxing/calculate` 获取四柱、五行占比、分析文案和珠宝建议
3. 如果用户点击“保存结果”，调用 `POST /api/wuxing/save`
4. 页面再次打开时，调用 `GET /api/wuxing/latest?userId=default` 回显最近一次结果
