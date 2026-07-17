const request = require("../../utils/request");
const auth = require("../../utils/auth");
const privacy = require("../../utils/privacy");
const config = require("../../utils/config");
const i18n = require("../../utils/i18n");

const HOME_URL = "/pages/home/index";
const WX_LOGIN_TIMEOUT_MS = 12000;
const WX_LOGIN_MAX_ATTEMPTS = 2;

Page({
  data: {
    serviceError: "",
    isLoggingIn: false,
    isAccountSubmitting: false,
    isCreatingAccount: false,
    isModeTransitioning: false,
    loginMode: "wechat",
    accountAuthEnabled: true,
    accountName: "",
    password: "",
    lastAccountAction: "login",
    agreed: false,
    redirect: "",
    copy: i18n.getCopy("login")
  },
  onLoad(options) {
    this.setData({
      agreed: false,
      accountAuthEnabled: config.isAccountAuthEnabled(),
      redirect: this.safeDecodeRedirect(options && options.redirect),
      copy: i18n.getCopy("login")
    });
    this.unsubscribeLocale = i18n.subscribe(() => this.setData({ copy: i18n.getCopy("login") }));
    if (auth.getAuthState().status !== "anonymous") {
      this.goHome().catch(() => null);
    }
  },
  login() {
    if (this.isAuthBusy()) {
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
          serviceError: error && error.message ? error.message : i18n.t("login.unavailable")
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
    if (!this.data.accountAuthEnabled) {
      this.setData({ serviceError: i18n.t("login.accountUnavailable") });
      return;
    }
    if (this.isAuthBusy()) return;

    const isRegister = action === "register";
    const loadingKey = isRegister ? "isCreatingAccount" : "isAccountSubmitting";

    const accountName = this.data.accountName.trim();
    const password = this.data.password;
    if (!accountName || !password) {
      this.setData({ serviceError: i18n.t("login.accountRequired") });
      return;
    }

    this.setData({ serviceError: "", lastAccountAction: action, [loadingKey]: true });

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
          serviceError: error && error.message ? error.message : i18n.t("login.unavailable")
        });
      })
      .then(() => {
        this.setData({ [loadingKey]: false });
      });
  },
  ensureLoginReady() {
    if (!this.data.agreed) {
      this.setData({ serviceError: i18n.t("login.agreementRequired") });
      return Promise.reject(new Error(i18n.t("login.agreementRequired")));
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
      throw new Error(i18n.t("login.unavailable"));
    }

    auth.acceptAuthenticatedSession(token, user);
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
        reject(new Error(i18n.t("login.timeout")));
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

          finish(() => reject(new Error(i18n.t("login.unavailable"))));
        },
        fail: (error) => {
          console.error("[login] wx.login fail", {
            attempt: currentAttempt,
            error
          });
          finish(() => reject(new Error(i18n.t("login.unavailable"))));
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
  safeDecodeRedirect(value) {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return "";
    }
  },
  getSafeRedirect() {
    return auth.getSafeLoginRedirect(this.data.redirect);
  },
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed,
      serviceError: ""
    });
  },
  switchLoginMode(event) {
    if (this.isAuthBusy()) return;
    const mode = event.currentTarget.dataset.mode;
    if (mode !== "account" && mode !== "wechat") return;
    if (mode === "account" && !this.data.accountAuthEnabled) return;
    if (mode === this.data.loginMode) return;
    this.setData({
      loginMode: mode,
      isModeTransitioning: true,
      serviceError: ""
    });
    clearTimeout(this.modeTransitionTimer);
    this.modeTransitionTimer = setTimeout(() => this.setData({ isModeTransitioning: false }), 240);
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
        serviceError: error && error.message ? error.message : i18n.t("login.privacyOpenFailed")
      });
    });
  },
  enterGuest() {
    if (this.isAuthBusy()) return;
    auth.enterGuestMode();
    wx.reLaunch({ url: HOME_URL });
  },
  isAuthBusy() {
    return this.data.isLoggingIn ||
      this.data.isAccountSubmitting ||
      this.data.isCreatingAccount;
  },
  retryLogin() {
    if (this.data.loginMode === "account") {
      this.submitAccount(this.data.lastAccountAction || "login");
      return;
    }
    this.login();
  },
  onUnload() {
    clearTimeout(this.modeTransitionTimer);
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  }
});
