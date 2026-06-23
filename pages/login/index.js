const request = require("../../utils/request");

const HOME_URL = "/subpackage/jewelry/pages/home/index";
const DEFAULT_LOGIN_ERROR = "登录暂时不可用，请稍后再试";

Page({
  data: {
    showPassword: false,
    passwordMode: true,
    eyeText: "显示",
    serviceError: "",
    isLoggingIn: false
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
    if (this.data.isLoggingIn) {
      return;
    }

    this.setData({
      serviceError: "",
      isLoggingIn: true
    });

    this.loginWithWechat()
      .then(() => this.goHome())
      .catch((error) => {
        console.error("wechat login failed", error);
        this.setData({
          serviceError: error && error.message ? error.message : DEFAULT_LOGIN_ERROR
        });
      })
      .then(() => {
        this.setData({
          isLoggingIn: false
        });
      });
  },
  loginWithWechat() {
    return this.getWechatLoginCode()
      .then((code) => request.post("/api/auth/wechat-login", { code }))
      .then((data) => {
        const token = data && data.token;
        const user = data && data.user;

        if (!token || !user) {
          throw new Error(DEFAULT_LOGIN_ERROR);
        }

        wx.setStorageSync("token", token);
        wx.setStorageSync("userInfo", user);
        return data;
      });
  },
  getWechatLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res && res.code) {
            resolve(res.code);
            return;
          }

          reject(new Error(DEFAULT_LOGIN_ERROR));
        },
        fail: () => {
          reject(new Error(DEFAULT_LOGIN_ERROR));
        }
      });
    });
  },
  goHome() {
    return new Promise((resolve, reject) => {
      wx.reLaunch({
        url: HOME_URL,
        success: resolve,
        fail: reject
      });
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
