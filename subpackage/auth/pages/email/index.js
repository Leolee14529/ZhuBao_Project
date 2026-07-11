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
        errorText: "请先阅读并同意用户协议与隐私政策"
      });
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      this.setData({
        errorText: "请输入有效的邮箱地址"
      });
      return;
    }
    wx.navigateTo({
      url: "/subpackage/auth/pages/password/index",
      fail: () => {
        this.setData({
          serviceError: "当前无法继续，请稍后再试"
        });
      }
    });
  },
  retryNext() {
    this.onNext();
  }
});
