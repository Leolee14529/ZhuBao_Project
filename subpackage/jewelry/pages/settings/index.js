const request = require("../../../../utils/request");
const auth = require("../../../../utils/auth");
const privacy = require("../../../../utils/privacy");
const share = require("../../../../utils/share");
const pageLayout = require("../../utils/page-layout");

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    currentLanguage: "中文",
    isDeviceBound: false,
    sleepEnabled: false,
    notificationsEnabled: false,
    profileTitle: "珠宝用户",
    avatarLetter: "U",
    isLoggingOut: false,
    toggleTouchStartX: 0,
    sections: [
      {
        title: "DEVICE",
        items: [
          { isRing: true, label: "指环连接 (Ring)", arrow: false, rowClass: "", valueClass: "row-value-shifted" },
          { isSleep: true, label: "夜间提醒", toggle: true, toggleClass: "toggle-off", rowClass: "setting-row-last" }
        ]
      },
      {
        title: "PREFERENCES",
        items: [
          { isBell: true, label: "消息通知", toggle: true, toggleClass: "toggle-off", rowClass: "" },
          { isLanguage: true, label: "语言 (Language)", arrow: false, rowClass: "setting-row-last" }
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
        const title = user.nickname || ("用户 " + String(user.id || "").slice(-6));
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
          title: error && error.message ? error.message : "退出失败，请稍后再试",
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
        title: error && error.message ? error.message : "微信隐私保护指引暂时无法打开",
        icon: "none"
      });
    });
  },
  clearCycleData() {
    wx.showModal({
      title: "清除周期记录",
      content: "将清除本机保存的周期记录和确认状态，不会影响服务器账号。",
      confirmText: "清除",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearCycleData();
        wx.showToast({ title: "已清除本机周期记录", icon: "success" });
      }
    });
  },
  withdrawConsent() {
    wx.showModal({
      title: "撤回同意",
      content: "撤回后将退出登录并清除本机个人数据。再次使用登录或保存功能时需重新同意。",
      confirmText: "撤回",
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
      title: "注销账号",
      content: "将删除账号、全部服务器业务数据，并清除本机周期记录。该操作不可恢复。",
      confirmText: "注销",
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/users/me")
          .then((data) => {
            if (!data || data.deleted !== true) {
              throw new Error("注销失败，请重试");
            }
            auth.clearAllLocalPersonalData();
            wx.reLaunch({ url: "/pages/login/index" });
          })
          .catch((error) => {
            if (error && error.statusCode === 401) return;
            wx.showToast({
              title: error && error.message ? error.message : "注销失败，请重试",
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
