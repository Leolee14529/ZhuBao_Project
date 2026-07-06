const HOME_SHARE_PATH = "/subpackage/jewelry/pages/home/index";
const HOME_SHARE_IMAGE = "/subpackage/jewelry/assets/product-1.jpg";
const HOME_SHARE_TITLE = "海米算力 | 五行能量珠宝";

function enableShareMenu() {
  if (typeof wx === "undefined" || !wx.showShareMenu) return;

  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"]
  });
}

function getHomeShareAppMessage() {
  return {
    title: HOME_SHARE_TITLE,
    path: HOME_SHARE_PATH,
    imageUrl: HOME_SHARE_IMAGE
  };
}

function getHomeShareTimeline() {
  return {
    title: HOME_SHARE_TITLE,
    query: "from=timeline",
    imageUrl: HOME_SHARE_IMAGE
  };
}

module.exports = {
  enableShareMenu,
  getHomeShareAppMessage,
  getHomeShareTimeline
};
