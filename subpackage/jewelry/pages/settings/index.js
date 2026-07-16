const request = require("../../../../utils/request");
const auth = require("../../../../utils/auth");
const privacy = require("../../../../utils/privacy");
const share = require("../../../../utils/share");
const pageLayout = require("../../utils/page-layout");

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    currentLanguage: "English",
    isDeviceBound: false,
    sleepEnabled: false,
    notificationsEnabled: false,
    profileTitle: "Jewelry User",
    avatarLetter: "U",
    isLoggingOut: false,
    toggleTouchStartX: 0,
    sections: [
      {
        title: "DEVICE",
        items: [
          { isRing: true, label: "Ring Connection", arrow: false, rowClass: "", valueClass: "row-value-shifted" },
          { isSleep: true, label: "Night Reminder", toggle: true, toggleClass: "toggle-off", rowClass: "setting-row-last" }
        ]
      },
      {
        title: "PREFERENCES",
        items: [
          { isBell: true, label: "Notifications", toggle: true, toggleClass: "toggle-off", rowClass: "" },
          { isLanguage: true, label: "Language", arrow: false, rowClass: "setting-row-last" }
        ]
      }
    ]
  },
  onLoad() {
    share.enableShareMenu();
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" })) return;
    const topSpacer = pageLayout.getContentOffset(64);
    if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer });
    const cachedUser = auth.getStoredUser ? auth.getStoredUser() : wx.getStorageSync("userInfo");
    if (cachedUser && typeof cachedUser === "object") this.applyUser(cachedUser);
    this.userRefreshTimer = setTimeout(() => this.loadCurrentUser(), 0);
  },
  onShareAppMessage() { return share.getPageShareAppMessage("/subpackage/jewelry/pages/settings/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/subpackage/jewelry/pages/settings/index"); },
  onShow() {
    auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" });
  },
  onUnload() {
    if (this.userRefreshTimer) clearTimeout(this.userRefreshTimer);
  },
  applyUser(user) {
    const safeUser = user || {};
    const title = safeUser.nickname || ("User " + String(safeUser.id || "").slice(-6));
    this.setData({
      profileTitle: title,
      avatarLetter: title.charAt(0).toUpperCase() || "U"
    });
  },
  loadCurrentUser() {
    request.get("/api/users/me")
      .then((data) => {
        const user = data.user || {};
        const title = user.nickname || ("User " + String(user.id || "").slice(-6));
        this.setData({
          profileTitle: title,
          avatarLetter: title.charAt(0).toUpperCase() || "U"
        });
        wx.setStorageSync("userInfo", user);
      })
      .catch((error) => {
        console.error("load current user failed", error);
      });
  },
  goHome() {
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/settings/index.js/goHome", "to", "/pages/home/index", "reason", "tab home");
    wx.redirectTo({
      url: "/pages/home/index"
    });
  },
  goData() {
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/settings/index.js/goData", "to", "/subpackage/jewelry/pages/data/index", "reason", "tab data");
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },
  logout() {
    if (this.data.isLoggingOut) return;
    this.setData({ isLoggingOut: true });

    request.post("/api/auth/logout")
      .then(() => {
        request.clearAuthState();
        wx.reLaunch({
          url: "/pages/login/index"
        });
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          request.clearAuthState();
          wx.reLaunch({ url: "/pages/login/index" });
          return;
        }
        wx.showToast({
          title: error && error.message ? error.message : "Logout failed. Please try again later.",
          icon: "none"
        });
        this.setData({ isLoggingOut: false });
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
      wx.showToast({
        title: error && error.message ? error.message : "The WeChat Privacy Guide cannot be opened right now.",
        icon: "none"
      });
    });
  },
  clearCycleData() {
    wx.showModal({
      title: "Clear Period Records",
      content: "This will clear local period records and confirmation status. It will not affect your server account.",
      confirmText: "Clear",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearCycleData();
        wx.showToast({ title: "Local period records cleared", icon: "success" });
      }
    });
  },
  withdrawConsent() {
    wx.showModal({
      title: "Withdraw Consent",
      content: "After withdrawal, you will be logged out and local personal data will be cleared. You must agree again before using sign-in or saved features.",
      confirmText: "Withdraw",
      success: (res) => {
        if (!res.confirm) return;
        request.post("/api/auth/logout").catch(() => null).then(() => {
          auth.clearAllLocalPersonalData();
          wx.reLaunch({ url: "/pages/login/index" });
        });
      }
    });
  },
  deleteAccount() {
    wx.showModal({
      title: "Close Account",
      content: "This will delete your account, all server data, and local period records. This action cannot be undone.",
      confirmText: "Close",
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/users/me")
          .then((data) => {
            if (!data || data.deleted !== true) {
              throw new Error("Account closure failed. Please try again.");
            }
            auth.clearAllLocalPersonalData();
            wx.reLaunch({ url: "/pages/login/index" });
          })
          .catch((error) => {
            if (error && error.statusCode === 401) return;
            wx.showToast({
              title: error && error.message ? error.message : "Account closure failed. Please try again.",
              icon: "none"
            });
          });
      }
    });
  },
  onSettingRowTap(event) {
    const { isLanguage, isRing } = event.currentTarget.dataset;
    if (isRing) {
      return;
    }
    if (isLanguage) {
      return;
    }
  },
  onToggleTap(event) {
    const { key } = event.currentTarget.dataset;
    if (!key) return;
    this.setData({
      [key]: !this.data[key]
    });
  },
  onToggleTouchStart(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    this.setData({
      toggleTouchStartX: touch.clientX
    });
  },
  onToggleTouchEnd(event) {
    const { key } = event.currentTarget.dataset;
    const touch = event.changedTouches && event.changedTouches[0];
    if (!key || !touch) return;

    const deltaX = touch.clientX - this.data.toggleTouchStartX;
    if (Math.abs(deltaX) < 12) return;

    this.setData({
      [key]: deltaX > 0
    });
  }
});
