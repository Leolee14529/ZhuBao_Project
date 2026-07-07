const auth = require("../../../utils/auth");
const share = require("../../../utils/share");

Page({
  data: {
    headerTop: 64
  },
  onLoad() {
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        headerTop: navLayout.contentOffset
      });
    }
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
