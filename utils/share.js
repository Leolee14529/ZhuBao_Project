const HOME_SHARE_PATH = "/pages/home/index";
const HOME_SHARE_IMAGE = "/subpackage/jewelry/assets/product-1.jpg";
const i18n = require("./i18n");

function enableShareMenu() {
  if (typeof wx === "undefined" || !wx.showShareMenu) return;

  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"]
  });
}

function getHomeShareAppMessage() {
  return {
    title: i18n.getLocale() === "en-US" ? "Ting's | Smart Jewelry" : "海米算力 | 五行饰品风格",
    path: HOME_SHARE_PATH,
    imageUrl: HOME_SHARE_IMAGE
  };
}

function getHomeShareTimeline() {
  return {
    title: i18n.getLocale() === "en-US" ? "Ting's | Smart Jewelry" : "海米算力 | 五行饰品风格",
    query: "from=timeline",
    imageUrl: HOME_SHARE_IMAGE
  };
}

module.exports = {
  enableShareMenu,
  getHomeShareAppMessage,
  getHomeShareTimeline
};
