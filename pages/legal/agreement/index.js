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
        const state = auth.getAuthState();
        wx.redirectTo({
          url: state.status === "anonymous" ? "/pages/login/index" : auth.HOME_URL
        });
      }
    });
  }
});
