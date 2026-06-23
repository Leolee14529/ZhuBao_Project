Page({
  data: {
    showPassword: false,
    passwordMode: true,
    eyeText: "显示",
    serviceError: ""
  },
  togglePassword() {
    const showPassword = !this.data.showPassword;
    this.setData({
      showPassword,
      passwordMode: !showPassword,
      eyeText: showPassword ? "隐藏" : "显示"
    });
  },
  login() {
    this.setData({
      serviceError: ""
    });
    wx.reLaunch({
      url: "/subpackage/jewelry/pages/home/index",
      fail: (err) => {
        console.error("login navigation failed", err);
        this.setData({
          serviceError: "当前无法继续，请稍后再试"
        });
      }
    });
  },
  retryLogin() {
    this.login();
  },
  openRegister() {
    wx.navigateTo({
      url: "/subpackage/auth/pages/email/index"
    });
  }
});
