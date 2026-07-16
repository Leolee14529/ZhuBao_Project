var auth = require("../../../../utils/auth");
var share = require("../../../../utils/share");
var pageLayout = require("../../utils/page-layout");

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    activity: {
      steps: "0 / 2000",
      distance: "0.00 / 10.00",
      calories: "0 / 100",
      progress: "0%"
    },
    sleep: [
      { name: "Calm", value: "0", width: "0%", color: "#10b981", cardClass: "sleep-card-left" },
      { name: "Ease", value: "0", width: "0%", color: "#34d399", cardClass: "sleep-card-mid" },
      { name: "Focus", value: "0", width: "0%", color: "#6ee7b7", cardClass: "sleep-card-right" }
    ]
  },
  onLoad() {
    share.enableShareMenu();
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    const topSpacer = pageLayout.getContentOffset(64);
    if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer });
  },
  onShareAppMessage() { return share.getPageShareAppMessage("/subpackage/jewelry/pages/data/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/subpackage/jewelry/pages/data/index"); },
  onShow() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
  },
  goHome() {
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/data/index.js/goHome", "to", "/pages/home/index", "reason", "tab home");
    wx.redirectTo({
      url: "/pages/home/index"
    });
  },
  goSettings() {
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/data/index.js/goSettings", "to", "/subpackage/jewelry/pages/settings/index", "reason", "tab settings");
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/settings/index"
    });
  },
  openPeriodCalendar() {
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    wx.navigateTo({
      url: "/subpackage/periodCalendar/pages/calendar/index"
    });
  },
  openSleepDetail() {
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/sleep-detail/index"
    });
  }
});
