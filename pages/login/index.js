const request = require("../../utils/request");
const auth = require("../../utils/auth");
const privacy = require("../../utils/privacy");

const HOME_URL = "/subpackage/jewelry/pages/home/index";
const DEFAULT_LOGIN_ERROR = "登录暂时不可用，请稍后再试";
const WX_LOGIN_TIMEOUT_MS = 12000;
const WX_LOGIN_MAX_ATTEMPTS = 2;

Page({
  data: {
    serviceError: "",
    isLoggingIn: false,
    isAccountSubmitting: false,
    isCreatingAccount: false,
    loginMode: "wechat",
    accountName: "",
    password: "",
    agreed: false,
    redirect: ""
  },
  onLoad(options) {
    this.setData({
      agreed: false,
      redirect: options && options.redirect ? decodeURIComponent(options.redirect) : ""
    });
  },
  login() {
    if (this.data.isLoggingIn) {
      return;
    }

    this.setData({ serviceError: "", isLoggingIn: true });

    this.ensureLoginReady()
      .then(() => this.loginWithWechat())
      .then((data) => this.acceptAuthData(data))
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
  accountLogin() {
    this.submitAccount("login");
  },
  accountRegister() {
    this.submitAccount("register");
  },
  submitAccount(action) {
    const isRegister = action === "register";
    const loadingKey = isRegister ? "isCreatingAccount" : "isAccountSubmitting";

    if (this.data[loadingKey]) return;

    const accountName = this.data.accountName.trim();
    const password = this.data.password;
    if (!accountName || !password) {
      this.setData({ serviceError: "请输入账号和密码" });
      return;
    }

    this.setData({ serviceError: "", [loadingKey]: true });

    this.ensureLoginReady()
      .then(() => request.post(isRegister ? "/api/auth/account-register" : "/api/auth/account-login", {
        accountName,
        password
      }))
      .then((data) => this.acceptAuthData(data))
      .then(() => this.goHome())
      .catch((error) => {
        console.error("account auth failed", error);
        this.setData({
          serviceError: error && error.message ? error.message : DEFAULT_LOGIN_ERROR
        });
      })
      .then(() => {
        this.setData({ [loadingKey]: false });
      });
  },
  ensureLoginReady() {
    if (!this.data.agreed) {
      this.setData({ serviceError: "请先阅读并同意用户协议与隐私政策" });
      return Promise.reject(new Error("请先阅读并同意用户协议与隐私政策"));
    }

    return privacy.checkWechatPrivacyReady({
      agreed: this.data.agreed,
      action: "login"
    });
  },
  acceptAuthData(data) {
    const token = data && data.token;
    const user = data && data.user;

    if (!token || !user) {
      throw new Error(DEFAULT_LOGIN_ERROR);
    }

    wx.setStorageSync("token", token);
    wx.setStorageSync("userInfo", user);
    auth.clearGuestMode();
    auth.acceptPrivacyConsent();
    return data;
  },
  loginWithWechat() {
    return this.getWechatLoginCode()
      .then((code) => request.post("/api/auth/wechat-login", { code }))
      .then((data) => data);
  },
  getWechatLoginCode(attempt) {
    const currentAttempt = attempt || 1;

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        console.error("[login] wx.login timeout", { attempt: currentAttempt });
        reject(new Error("微信登录超时，请稍后重试"));
      }, WX_LOGIN_TIMEOUT_MS);

      const finish = (callback) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        callback();
      };

      wx.login({
        success: (res) => {
          if (res && res.code) {
            finish(() => resolve(res.code));
            return;
          }

          finish(() => reject(new Error(DEFAULT_LOGIN_ERROR)));
        },
        fail: (error) => {
          console.error("[login] wx.login fail", {
            attempt: currentAttempt,
            error
          });
          finish(() => reject(new Error(DEFAULT_LOGIN_ERROR)));
        }
      });
    }).catch((error) => {
      if (currentAttempt >= WX_LOGIN_MAX_ATTEMPTS) {
        throw error;
      }

      console.warn("[login] wx.login retry", { nextAttempt: currentAttempt + 1 });
      return new Promise((resolve) => {
        setTimeout(resolve, 600);
      }).then(() => this.getWechatLoginCode(currentAttempt + 1));
    });
  },
  goHome() {
    return new Promise((resolve, reject) => {
      const redirect = this.getSafeRedirect();
      wx.reLaunch({
        url: redirect || HOME_URL,
        success: resolve,
        fail: reject
      });
    });
  },
  getSafeRedirect() {
    const redirect = this.data.redirect;
    if (redirect === "/subpackage/jewelry/pages/data/index" ||
      redirect === "/subpackage/jewelry/pages/settings/index" ||
      redirect === "/subpackage/jewelry/pages/five-elements/index" ||
      redirect === "/subpackage/periodCalendar/pages/calendar/index") {
      return redirect;
    }
    return "";
  },
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed,
      serviceError: ""
    });
  },
  switchLoginMode(event) {
    const mode = event.currentTarget.dataset.mode;
    if (mode !== "account" && mode !== "wechat") return;
    this.setData({
      loginMode: mode,
      serviceError: ""
    });
  },
  onAccountInput(event) {
    this.setData({
      accountName: event.detail.value,
      serviceError: ""
    });
  },
  onPasswordInput(event) {
    this.setData({
      password: event.detail.value,
      serviceError: ""
    });
  },
  openAgreement() {
    wx.navigateTo({ url: "/pages/legal/agreement/index" });
  },
  openPrivacy() {
    wx.navigateTo({ url: "/pages/legal/privacy/index" });
  },
  openWechatPrivacy() {
    privacy.openWechatPrivacyContract().catch((error) => {
      this.setData({
        serviceError: error && error.message ? error.message : "微信隐私保护指引暂时无法打开"
      });
    });
  },
  enterGuest() {
    auth.enterGuestMode();
    wx.reLaunch({ url: HOME_URL });
  },
  retryLogin() {
    if (this.data.loginMode === "account") {
      this.accountLogin();
      return;
    }
    this.login();
  }
});
