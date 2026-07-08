var fiveElements = require("../../utils/five-elements");
var request = require("../../../../utils/request");
var auth = require("../../../../utils/auth");
var share = require("../../../../utils/share");

Page({
  data: {
    topSpacer: 40,
    hasWuxingResult: false,
    focusElement: "无",
    radarValues: [0, 0, 0, 0, 0],
    radarNote: "暂无元素参考数据。",
    sleep: [
      { name: "深睡", value: "0", width: "0%", color: "#10b981", cardClass: "sleep-card-left" },
      { name: "浅睡", value: "0", width: "0%", color: "#34d399", cardClass: "sleep-card-mid" },
      { name: "REM", value: "0", width: "0%", color: "#6ee7b7", cardClass: "sleep-card-right" }
    ],
    elements: [
      { name: "木 (Wood)", jade: "暂无参考数据", suitable: "0% · 暂无参考数据", color: "#10b981", rowClass: "" },
      { name: "水 (Water)", jade: "暂无参考数据", suitable: "0% · 暂无参考数据", color: "#3b82f6", rowClass: "" },
      { name: "火 (Fire)", jade: "暂无参考数据", suitable: "0% · 暂无参考数据", color: "#f43f5e", rowClass: "" },
      { name: "金 (Metal)", jade: "暂无参考数据", suitable: "0% · 暂无参考数据", color: "#e2e8f0", rowClass: "" },
      { name: "土 (Earth)", jade: "暂无参考数据", suitable: "0% · 暂无参考数据", color: "#d97706", rowClass: "element-row-last" }
    ]
  },
  onLoad() {
    share.enableShareMenu();
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
    this.applyBirthProfile();
  },
  onShareAppMessage() { return share.getPageShareAppMessage("/subpackage/jewelry/pages/data/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/subpackage/jewelry/pages/data/index"); },
  onShow() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    this.applyBirthProfile();
    this.refreshLatestResult();
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
  applyBirthProfile() {
    var savedResult = fiveElements.getSavedWuxingResult();
    var profile = fiveElements.buildCurrentProfile();
    this.setData({
      hasWuxingResult: !!savedResult,
      focusElement: profile.focusElement,
      radarValues: profile.radarValues,
      radarNote: profile.radarNote,
      elements: profile.elements
    });
  },
  refreshLatestResult() {
    request.get("/api/wuxing/latest")
      .then(function (data) {
        fiveElements.saveWuxingResult(data.result);
        this.applyBirthProfile();
      }.bind(this))
      .catch(function (error) {
        if (error && error.code === "WUXING_RESULT_NOT_FOUND") {
          auth.clearWuxingLocalData();
          this.applyBirthProfile();
        } else if (error) {
          console.error("load latest wuxing result failed", error);
        }
      }.bind(this));
  }
});
