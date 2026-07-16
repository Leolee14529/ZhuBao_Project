const HOME_SHARE_PATH = "/pages/home/index";
const HOME_SHARE_IMAGE = "/pages/home/assets/product-1.jpg";
const HOME_SHARE_TITLE = "Haimi Power | Jewelry Style Reference";
const PAGE_SHARE_CONFIGS = {
  "/pages/home/index": { title: HOME_SHARE_TITLE },
  "/pages/login/index": { title: HOME_SHARE_TITLE },
  "/pages/legal/agreement/index": { title: "Haimi Power | User Agreement" },
  "/pages/legal/privacy/index": { title: "Haimi Power | Privacy Policy" },
  "/subpackage/jewelry/pages/data/index": { title: "Haimi Power | Records" },
  "/subpackage/jewelry/pages/settings/index": { title: "Haimi Power | Settings" },
  "/subpackage/jewelry/pages/products/index": {
    title: "Haimi Power | Style Reference",
    imageUrl: "/subpackage/jewelry/assets/product-6.jpg"
  },
  "/subpackage/jewelry/pages/product-detail/index": {
    title: "Haimi Power | Style Detail",
    imageUrl: "/subpackage/jewelry/assets/product-6.jpg"
  },
  "/subpackage/periodCalendar/pages/calendar/index": { title: "Haimi Power | Cycle Records" }
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
  const hasPageConfig = !!PAGE_SHARE_CONFIGS[pagePath];
  const config = hasPageConfig ? PAGE_SHARE_CONFIGS[pagePath] : PAGE_SHARE_CONFIGS[HOME_SHARE_PATH];
  return {
    title: config.title || HOME_SHARE_TITLE,
    path: hasPageConfig ? pagePath : HOME_SHARE_PATH,
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
