const auth = require("../../../utils/auth");
const share = require("../../../utils/share");
const topLayout = require("../../../utils/top-layout");

Page({
  data: {
    headerTop: topLayout.getTopLayout().headerTop,
    consentMode: false
  },
  onLoad(options) {
    share.enableShareMenu();
    this.setData({ headerTop: topLayout.getTopLayout().headerTop });
    this.setData({
      consentMode: options && options.mode === "consent"
    });
  },
  onShareAppMessage() { return share.getPageShareAppMessage("/pages/legal/privacy/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/pages/legal/privacy/index"); },
  acceptAndGoBack() {
    auth.acceptPrivacyConsent();
    wx.showToast({
      title: "Privacy Policy accepted",
      icon: "success"
    });
    setTimeout(() => this.goBack(), 300);
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
