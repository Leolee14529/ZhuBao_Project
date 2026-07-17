const auth = require("../../../utils/auth");
const i18n = require("../../../utils/i18n");

Page({
  data: {
    headerTop: 64,
    consentMode: false,
    copy: i18n.getCopy("legal")
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
    this.unsubscribeLocale = i18n.subscribe(() => this.setData({ copy: i18n.getCopy("legal") }));
  },
  acceptAndGoBack() {
    auth.acceptPrivacyConsent();
    wx.showToast({
      title: i18n.t("legal.privacyAccepted"),
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
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  }
});
