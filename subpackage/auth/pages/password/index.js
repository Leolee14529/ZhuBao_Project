Page({
  data: {
    statusBarHeight: 44,
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirm: false,
    errorText: "",
    agreed: false,
    serviceError: ""
  },

  onLoad() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: info.statusBarHeight || 44
    });
  },

  onBackTap() {
    wx.navigateBack();
  },

  onPasswordInput(event) {
    this.setData({
      password: event.detail.value,
      errorText: "",
      serviceError: ""
    });
  },

  onConfirmInput(event) {
    this.setData({
      confirmPassword: event.detail.value,
      errorText: "",
      serviceError: ""
    });
  },

  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  onToggleConfirm() {
    this.setData({
      showConfirm: !this.data.showConfirm
    });
  },

  onAgreementToggle() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  onNext() {
    const { password, confirmPassword, agreed } = this.data;
    if (!agreed) {
      this.setData({
        errorText: "请先阅读并同意用户协议与隐私政策"
      });
      return;
    }
    if (password.length < 8 || password.length > 16) {
      this.setData({
        errorText: "密码需要 8-16 个字符"
      });
      return;
    }
    if (password !== confirmPassword) {
      this.setData({
        errorText: "两次输入的密码不一致"
      });
      return;
    }
    console.warn("[ROUTE]", "from subpackage/auth/pages/password/index.js/submitPassword", "to", "/pages/home/index", "reason", "password submit success");
    wx.reLaunch({
      url: "/pages/home/index",
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
