const HOME_SHARE_PATH = "/subpackage/jewelry/pages/home/index";
const HOME_SHARE_IMAGE = "/subpackage/jewelry/assets/product-1.jpg";
const HOME_SHARE_TITLE = "海米算力 | 五行能量珠宝";
const PAGE_SHARE_CONFIGS = {
  "/pages/login/index": { title: HOME_SHARE_TITLE },
  "/pages/legal/agreement/index": { title: "海米算力 | 用户协议" },
  "/pages/legal/privacy/index": { title: "海米算力 | 隐私政策" },
  "/subpackage/jewelry/pages/home/index": { title: HOME_SHARE_TITLE },
  "/subpackage/jewelry/pages/data/index": { title: "海米算力 | 健康数据记录" },
  "/subpackage/jewelry/pages/settings/index": { title: "海米算力 | 设置中心" },
  "/subpackage/jewelry/pages/five-elements/index": { title: "海米算力 | 五行定制" },
  "/subpackage/periodCalendar/pages/calendar/index": { title: "海米算力 | 智能经期日历" }
};

function enableShareMenu() {
  if (typeof wx === "undefined" || !wx.showShareMenu) return;

  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"]
  });
}

function getHomeShareAppMessage() {
  return getPageShareAppMessage(HOME_SHARE_PATH);
}

function getHomeShareTimeline() {
  return getPageShareTimeline(HOME_SHARE_PATH);
}

function getPageShareConfig(path) {
  const pagePath = path || HOME_SHARE_PATH;
  const config = PAGE_SHARE_CONFIGS[pagePath] || PAGE_SHARE_CONFIGS[HOME_SHARE_PATH];
  return {
    title: config.title || HOME_SHARE_TITLE,
    path: pagePath,
    imageUrl: config.imageUrl || HOME_SHARE_IMAGE
  };
}

function getPageShareAppMessage(path) {
  const config = getPageShareConfig(path);
  return {
    title: config.title,
    path: config.path,
    imageUrl: config.imageUrl
  };
}

function getPageShareTimeline(path) {
  const config = getPageShareConfig(path);
  return {
    title: config.title,
    query: "from=timeline&page=" + encodeURIComponent(config.path),
    imageUrl: config.imageUrl
  };
}

module.exports = {
  enableShareMenu,
  getPageShareAppMessage,
  getPageShareTimeline,
  getHomeShareAppMessage,
  getHomeShareTimeline
};
