const request = require("../../../../utils/request");
const auth = require("../../../../utils/auth");
const privacy = require("../../../../utils/privacy");

Page({
  data: {
    topSpacer: 40,
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
          { isSleep: true, label: "睡眠模式", toggle: true, toggleClass: "toggle-off", rowClass: "setting-row-last" }
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
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" })) return;
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
    this.loadCurrentUser();
  },
  onShow() {
    auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" });
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
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/settings/index.js/goHome", "to", "/subpackage/jewelry/pages/home/index", "reason", "tab home");
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/home/index"
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
      .catch(() => null)
      .then(() => {
        request.clearAuthState();
        wx.reLaunch({
          url: "/pages/login/index"
        });
      })
      .then(() => {
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
      title: "清除经期记录",
      content: "将清除本机保存的经期记录和确认状态，不会影响服务器账号。",
      confirmText: "清除",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearCycleData();
        wx.showToast({ title: "已清除本机经期记录", icon: "success" });
      }
    });
  },
  deleteWuxingProfile() {
    wx.showModal({
      title: "删除出生资料",
      content: "将删除出生资料和五行结果，本地和服务器记录都会清空。",
      confirmText: "删除",
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/wuxing/profile")
          .then(() => {
            auth.clearWuxingLocalData();
            wx.showToast({ title: "已删除五行资料", icon: "success" });
          })
          .catch((error) => {
            wx.showToast({
              title: error && error.message ? error.message : "删除失败，请重试",
              icon: "none"
            });
          });
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
      content: "将删除账号、全部服务器业务数据、出生资料、五行结果，并清除本机经期记录。该操作不可恢复。",
      confirmText: "注销",
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/users/me")
          .catch((error) => {
            if (error && error.statusCode === 401) return null;
            throw error;
          })
          .then(() => {
            auth.clearAllLocalPersonalData();
            wx.reLaunch({ url: "/pages/login/index" });
          })
          .catch((error) => {
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
