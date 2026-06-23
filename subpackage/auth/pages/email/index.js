Page({
  data: {
    statusBarHeight: 44,
    email: "",
    errorText: "",
    agreed: true,
    serviceError: ""
  },

  onLoad() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: info.statusBarHeight || 44
    });
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
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
