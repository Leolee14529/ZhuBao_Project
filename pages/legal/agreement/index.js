const auth = require("../../../utils/auth");
const i18n = require("../../../utils/i18n");

Page({
  data: {
    headerTop: 64,
    copy: i18n.getCopy("legal")
  },
  onLoad() {
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        headerTop: navLayout.contentOffset
      });
    }
    this.unsubscribeLocale = i18n.subscribe(() => this.setData({ copy: i18n.getCopy("legal") }));
  },
  onUnload() { if (this.unsubscribeLocale) this.unsubscribeLocale(); },
  goBack() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: "/pages/home/index" });
      }
    });
  }
});
