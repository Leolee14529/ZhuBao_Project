const auth = require("../../../utils/auth");

Page({
  data: {
    headerTop: 64,
    consentMode: false
  },
  onLoad(options) {
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        headerTop: navLayout.contentOffset
      });
    }
    this.setData({
      consentMode: options && options.mode === "consent"
    });
  },
  acceptAndGoBack() {
    auth.acceptPrivacyConsent();
    wx.showToast({
      title: "已同意隐私政策",
      icon: "success"
    });
    setTimeout(() => this.goBack(), 300);
  },
  goBack() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: "/pages/home/index" });
      }
    });
  }
});
