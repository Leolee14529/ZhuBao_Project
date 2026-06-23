Page({
  data: {
    topSpacer: 40,
    currentLanguage: "中文",
    isDeviceBound: false,
    sleepEnabled: true,
    notificationsEnabled: false,
    toggleTouchStartX: 0,
    sections: [
      {
        title: "DEVICE",
        items: [
          { isRing: true, label: "指环连接 (Ring)", arrow: false, rowClass: "", valueClass: "row-value-shifted" },
          { isSleep: true, label: "睡眠模式", toggle: true, toggleClass: "toggle-on", rowClass: "setting-row-last" }
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
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
  },
  goHome() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/home/index"
    });
  },
  goData() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },
  logout() {
    wx.redirectTo({
      url: "/pages/login/index"
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
