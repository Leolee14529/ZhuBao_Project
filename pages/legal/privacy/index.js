const auth = require("../../../utils/auth");
const share = require("../../../utils/share");

Page({
  data: {
    headerTop: 64,
    consentMode: false
  },
  onLoad(options) {
    share.enableShareMenu();
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
  onShareAppMessage() { return share.getPageShareAppMessage("/pages/legal/privacy/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/pages/legal/privacy/index"); },
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
        const state = auth.getAuthState();
        wx.redirectTo({
          url: state.status === "anonymous" ? "/pages/login/index" : auth.HOME_URL
        });
      }
    });
  }
});
