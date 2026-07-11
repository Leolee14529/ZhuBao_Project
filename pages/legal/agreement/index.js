const auth = require("../../../utils/auth");
const share = require("../../../utils/share");
const topLayout = require("../../../utils/top-layout");

Page({
  data: {
    headerTop: topLayout.getTopLayout().headerTop
  },
  onLoad() {
    share.enableShareMenu();
    this.setData({ headerTop: topLayout.getTopLayout().headerTop });
  },
  onShareAppMessage() { return share.getPageShareAppMessage("/pages/legal/agreement/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/pages/legal/agreement/index"); },
  goBack() {
    wx.navigateBack({
      fail() {
        const state = auth.getAuthState();
        wx.redirectTo({
          url: state.status === "anonymous" ? "/pages/login/index" : auth.HOME_URL
        });
      }
    });
  }
});
