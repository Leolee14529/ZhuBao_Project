# 五行定制后端

这是一个独立的 Node.js + Express 后端，只提供五行定制相关接口。

本项目没有登录、没有经期日历、没有第三方 API 调用，四柱八字和五行计算全部在本地完成。

## 安装步骤

```bash
npm install
npm run dev
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
├─ routes/
│  └─ wuxing.js
├─ services/
│  └─ baziService.js
├─ data/
│  └─ wuxing.json
└─ README.md
```

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
