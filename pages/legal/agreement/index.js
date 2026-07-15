const auth = require("../../../utils/auth");

Page({
  data: {
    headerTop: 64
  },
  onLoad() {
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        headerTop: navLayout.contentOffset
      });
    }
  },
  goBack() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: "/pages/home/index" });
      }
    });
  }
});
