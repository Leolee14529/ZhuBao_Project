# ZhuBao Project

## 当前发布版本

- 版本号：`1.1.0`
- 版本名称：每日心情与首帧稳定版
- 发布日期：`2026-07-11`
- GitHub 分支：`agent/miniapp-stability-v1.1.0`
- 固定交接标签：`v1.1.0-rc.1`（Pre-release）
- GitHub Release：[ZhuBao v1.1.0-rc.1](https://github.com/Leolee14529/ZhuBao_Project/releases/tag/v1.1.0-rc.1)
- 版本记录与 UI 故障路由：[`CHANGELOG.md`](./CHANGELOG.md)
- PR 对比分支：`codex/share-audit-ui-polish`
- 微信基础库：`3.15.2`（平台 SDK 版本，不是产品版本号）

## 版本内容

- 新增后端每日心情模板、用户每日心情记录和 `GET /api/mood/today`。
- 修复过期会话清理顺序、匿名 guest ID 隐私同意和异步响应 owner 归属。
- 为全部注册页面补齐深色首帧背景与分包预下载，消除页面切换白屏。
- 稳定状态栏、页面顶部间距、底部导航激活态和重复导航。
- 商品详情首帧使用暗色内容壳；周期页首帧直接生成 6 周日历。
- 心情卡、周期设置弹层和图片开关均增加稳定尺寸或完整数据门控。

## 本次筛选范围

本分支从 `2448fcc` 创建，完整保留功能依赖。面向 `codex/share-audit-ui-polish` 的 PR 只展示以下功能提交和本次版本交接提交：

1. `a65dc06` — 每日心情功能。
2. `c6cdbe4` — 隐私、会话和数据归属修复。
3. `2448fcc` — 首帧、导航与组件稳定性修复。

明确不纳入旧 `stash@{0}`、`.tmp/`、运行时 `backend/data/*.json`、`.env`、依赖目录和临时 UI 修复方案。README、协作和交接文档保留在 GitHub，但通过 `project.config.json` 排除在小程序上传包之外。

## 验证结果

- Node 24：JS 语法、67/67 测试和 300 行限制通过。
- 68 个版本范围内 JSON 文件解析通过，`git diff --check` 通过。
- 微信开发者工具 CLI `preview` 成功，总包约 1.4 MB。
- 10 个注册路由全部可读取，新增 AppService 错误和异常为 0。
- 6 组关键页面切换采样 47 帧，白帧 0、截图失败 0。
- 底部导航双击只发生一次跳转；周期设置弹层首次与重开均为完整 6 周状态。

## 已知外部依赖

生产环境需要部署当前后端的 mood 路由和数据库迁移。若线上 `/api/mood/today` 尚未部署，首页会显示本地安全兜底，不会白屏。

## UI 协作者入口

从固定候选标签创建新分支，不要移动或强推 `v1.1.0-rc.1`：

```powershell
git fetch origin --prune --tags
git switch -c agent/ui-<主题>-v1.1.x v1.1.0-rc.1
```

PR #5 叠加在 PR #4 上；具体线程归属、症状到文件的定位表和最低回归要求见 [`CHANGELOG.md`](./CHANGELOG.md)。

PR #4/#5 尚为 Draft 且没有 GitHub CI checks，所以稳定标签 `v1.1.0` 暂不创建；应在评审并合入默认分支后标记最终 merge SHA。
