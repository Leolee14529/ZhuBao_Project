const HOME_SHARE_PATH = "/pages/home/index";
const HOME_SHARE_IMAGE = "/subpackage/jewelry/assets/product-1.jpg";
const HOME_SHARE_TITLE = "海米算力 | 珠宝风格参考";
const PAGE_SHARE_CONFIGS = {
  "/pages/home/index": { title: HOME_SHARE_TITLE },
  "/pages/login/index": { title: HOME_SHARE_TITLE },
  "/pages/legal/agreement/index": { title: "海米算力 | 用户协议" },
  "/pages/legal/privacy/index": { title: "海米算力 | 隐私政策" },
  "/subpackage/jewelry/pages/data/index": { title: "海米算力 | 记录中心" },
  "/subpackage/jewelry/pages/settings/index": { title: "海米算力 | 设置中心" },
  "/subpackage/jewelry/pages/five-elements/index": { title: "海米算力 | 色彩风格" },
  "/subpackage/jewelry/pages/products/index": {
    title: "海米算力 | 系列产品",
    imageUrl: "/subpackage/jewelry/assets/product-6.jpg"
  },
  "/subpackage/periodCalendar/pages/calendar/index": { title: "海米算力 | 周期记录" }
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
