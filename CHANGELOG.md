# 版本记录与 UI 交接指南

本项目使用语义化版本。已发布标签是只读基线；后续修复应从标签创建新分支，不要移动、覆盖或强推已有标签。

## Unreleased

下一位 UI 协作者请从 `v1.1.0-rc.1` 创建独立分支，并把变更、验证结果和已知风险登记在这里。

建议分支名：`agent/ui-<主题>-v1.1.x`。

## [1.1.0-rc.1] - 2026-07-11

目标产品版本：`1.1.0`。GitHub 版本名称：每日心情与首帧稳定候选版。

### GitHub 坐标

- 固定交接版本：`v1.1.0-rc.1`（Pre-release）
- 发布分支：`agent/miniapp-stability-v1.1.0`
- UI 基础 PR：[#4](https://github.com/Leolee14529/ZhuBao_Project/pull/4)，`codex/share-audit-ui-polish` → `sync/local-to-github`
- 本版本 PR：[#5](https://github.com/Leolee14529/ZhuBao_Project/pull/5)，`agent/miniapp-stability-v1.1.0` → `codex/share-audit-ui-polish`
- GitHub Release：[ZhuBao v1.1.0-rc.1](https://github.com/Leolee14529/ZhuBao_Project/releases/tag/v1.1.0-rc.1)

PR #5 是叠加在 PR #4 上的评审层。除非负责人明确决定改写历史，否则不要把 #5 直接改到默认分支，也不要压平或强推这两层分支。

PR #4/#5 当前均为 Draft 且 GitHub 没有 CI checks，因此本次只发布候选版。正式 `v1.1.0` 应在两条 PR 评审并合入默认分支后，标记到最终 merge SHA。

### 本版内容

- 新增服务端每日心情模板、用户每日记录和 `GET /api/mood/today`。
- 修复失效会话的 owner 数据清理、隐私同意前 guest ID、损坏 ID 自愈和异步响应归属。
- 为全部注册页面补齐深色首帧、稳定内容壳和分包预下载，消除已复现的页面切换白屏。
- 修复底部导航重复触发、激活态闪动、状态栏间距跳变、商品详情空壳和周期组件首帧不完整。

### 本轮线程与提交

| 角色 | 提交/版本 | 修改重点 | 首要入口 |
| --- | --- | --- | --- |
| 线程 A：心情/首页/后端 | `a65dc06` | 每日心情数据、接口、首页展示 | `backend/routes/mood.js`、`backend/services/mood*.js`、`pages/home/mood-runtime.js` |
| 线程 A follow-up | `c6cdbe4` | 隐私、会话清理、owner 归属 | `utils/auth.js`、`pages/home/index.js`、`pages/home/mood-runtime.js` |
| 线程 B：闪屏/首帧 | `2448fcc` | 页面背景、导航、商品与周期首帧 | `app.json`、`components/status-bar`、`subpackage/jewelry`、`subpackage/periodCalendar` |
| 上传/发布 Agent | `v1.1.0-rc.1` | 版本统一、筛选发布、交接与 GitHub Pre-release | `README.md`、`CHANGELOG.md`、`交接文档.md`、`协作工作区.md` |

### UI 协作者起步

```powershell
git fetch origin --prune --tags
git switch -c agent/ui-<主题>-v1.1.x v1.1.0-rc.1
```

修改 UI 时请保留以下稳定性约束：

1. 页面和组件必须有不透明的深色首帧背景；不要依赖异步数据返回后才铺底色。
2. 首页底栏由 `pages/home/index.wxml` 与 `pages/home/nav.wxss` 实现；记录/设置页使用 `subpackage/jewelry/components/bottom-nav`。这是两套实现，改一处不会自动同步另一处。
3. 底部导航的当前态由目标路由直接确定，并继续使用导航锁，避免连点造成重复跳转。
4. 常规页面的 `status-bar`、`page-layout.js` 和 `topSpacer` 是同一套安全区链路；周期页还会在 `calendar-state.js` 独立计算安全区，修改前必须同时核对。
5. 不要在页面内重新绘制时间、信号、电量或三点胶囊；只保留微信系统胶囊和透明安全区占位。
6. 商品详情在数据返回前也要保留稳定内容壳；周期首页初始 data 必须已有完整 6 周网格。
7. 周期设置弹层和图片开关只在完整数据就绪后显示；心情卡与今日灵感翻面卡需保留稳定高度。

### 修改风险矩阵

| 范围 | 处理规则 |
| --- | --- |
| UI Agent 可安全修改 | 正式页面的 WXML/WXSS、页面图片和静态文案；保留根节点不透明背景、首帧稳定尺寸与 safe-area 留白，并检查小屏、刘海屏和高屏设备 |
| 修改前必须协调并完整回归 | `app.js`/`app.json`/`app.wxss`、页面 JSON/JS、`components/status-bar`、`page-layout.js`、`bottom-nav.js`、`calendar-state.js`、周期组件 JS、`utils/products.js`；它们控制路由、预载、首帧数据、安全区或导航锁 |
| UI 任务默认禁止 | `utils/auth.js`、`utils/request.js`、`utils/privacy.js`、`pages/home/mood-runtime.js`、后端、迁移和法律正文；除非问题明确来自这些范围，不要夹带业务/隐私修改 |
| 发布操作禁止 | 移动/强推 `v1.1.0-rc.1`，抢先创建稳定 `v1.1.0`，改写 PR #4/#5 历史，恢复旧 stash，提交 `.tmp`/`.env`/运行数据，修改 AppID，或把产品版本误写到 `libVersion` |

### 当前 10 个正式路由

```text
pages/home/index
pages/login/index
pages/legal/agreement/index
pages/legal/privacy/index
subpackage/jewelry/pages/data/index
subpackage/jewelry/pages/settings/index
subpackage/jewelry/pages/five-elements/index  # 历史兼容入口，应自动回首页
subpackage/jewelry/pages/products/index
subpackage/jewelry/pages/product-detail/index?id=jade-circuit-collar
subpackage/periodCalendar/pages/calendar/index
```

旧认证、设备和 showcase 路由仍在仓库中作历史参考，但已从正式 `app.json` 注册面和提审包中排除。

`subpackage/jewelry/components/status-bar` 当前未被正式注册路由使用；修改它不会修复现有页面。

### 症状到代码的定位表

| 症状 | 优先检查 | 最低回归 |
| --- | --- | --- |
| 页面进入或切换出现白帧 | `app.json` 的 `preloadRule`、相关页面 `index.json`/WXSS、根容器背景 | DevTools preview、目标路由进入/返回、连续帧采样 |
| 底部导航双跳或激活态闪烁 | `subpackage/jewelry/components/bottom-nav` | 连续双击只跳转一次，页面栈保持 1 |
| 顶部偏移、刘海区露白 | `components/status-bar`、`subpackage/jewelry/utils/page-layout.js`、页面 `topSpacer` | 首页、记录、设置三页首帧与旋转/重进 |
| 商品详情短暂无内容或布局塌陷 | `subpackage/jewelry/pages/product-detail`、`subpackage/jewelry/utils/products.js` | 本地正常数据、缺失 ID、非法 product ID；保留 hero placeholder/loading shell |
| 周期网格跳变或弹层显示不全 | `subpackage/periodCalendar/pages/calendar/calendar-state.js`、`cycle-setup-sheet`、`reference-switch` | 初次打开、关闭后重开均为完整 6 周 |
| 心情串号、隐私同意前产生身份或兜底异常 | `pages/home/mood-runtime.js`、`pages/home/index.js`、`utils/auth.js`、`utils/request.js` | 匿名、登录切换、401、慢响应与页面卸载 |
| 线上 `/api/mood/today` 返回 404 | `backend/routes/mood.js`、`backend/db/migrations/004_daily_mood.sql`、部署配置 | 部署路由和迁移后跑 API 测试；前端兜底仅防白屏 |

### 发布回归基线

- 使用 Node `>=24 <25` 在 `backend` 执行 `pnpm run check:syntax`、`pnpm test`、`pnpm run check:lines`。
- 67/67 测试、68 个版本范围内 JSON 解析和 300 行限制通过。
- 微信开发者工具 CLI `preview` 成功，总包约 1.4 MB。
- 10 个注册路由可读取，新增 AppService 错误/异常为 0。
- 6 组关键页面切换采样 47 帧：白帧 0，截图失败 0。

做 DevTools 视觉回归时，主窗口必须在桌面可见且不要最小化；同一时间只连接一个目标会话，并优先截取手机画布。截图失败、工具灰色画布残影和功能断言必须分开记录：若绿色残影只出现在手机画布之外，应先按 DevTools/GPU 截图问题排查，不要直接修改业务 UI。

- 项目根目录：`C:\Users\Administrator\Documents\ZhuBao\ZhuBao_Project`
- AppID：`wx6a3e331330572b67`
- 自动化顺序：先检查路由、根选择器尺寸、页面 data 和 AppService `console.error`/`exception`，再采集截图。
- 遇到登录、AppID、信任项目或权限弹窗时停止后台自动化；结束时优先断开会话，不要默认关闭 DevTools。
- UI 最低交互回归：10/10 路由、首页/记录/设置底栏双击、商品列表到详情及返回、日历首次进入与弹层重开、连续帧白帧检测。
- 修改 `project.config.json`、页面 JSON 或分包后必须重新 preview；怀疑缓存时只清理 compile cache。

### 不应纳入后续提交

- 本地旧 `stash@{0}`。
- `.tmp/`、`.env`、`backend/data/*.json`、`node_modules/`。
- 临时 UI 修复方案和开发者个人运行数据。

后续 UI 补丁优先发布为 `1.1.1` 一类版本，并同步 `backend/package.json`、设置页版本文字、README、CHANGELOG 和新标签；微信 `libVersion: 3.15.2` 仍只代表 SDK。
