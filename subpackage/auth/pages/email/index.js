const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    email: "",
    errorText: "",
    agreed: true,
    serviceError: ""
  },

  onLoad() {
    this.setData({
      statusBarHeight: topLayout.getTopLayout().statusBarHeight
    });
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        console.warn("[ROUTE]", "from subpackage/auth/pages/email/index.js/onBackTap", "to", "/pages/login/index", "reason", "navigateBack fail");
        wx.redirectTo({
          url: "/pages/login/index"
        });
      }
    });
  },

  onEmailInput(event) {
    this.setData({
      email: event.detail.value,
      errorText: "",
      serviceError: ""
    });
  },

  onAgreementToggle() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  onNext() {
    const { email, agreed } = this.data;
    if (!agreed) {
      this.setData({
        errorText: "Please read and agree to the User Agreement and Privacy Policy first"
      });
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      this.setData({
        errorText: "Enter a valid email address"
      });
      return;
    }
    wx.navigateTo({
      url: "/subpackage/auth/pages/password/index",
      fail: () => {
        this.setData({
          serviceError: "Cannot continue right now. Please try again later."
        });
      }
    });
  },
  retryNext() {
    this.onNext();
  }
});
