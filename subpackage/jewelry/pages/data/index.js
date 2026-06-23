var fiveElements = require("../../utils/five-elements");

Page({
  data: {
    topSpacer: 40,
    focusElement: "木",
    radarValues: [0.88, 0.82, 0.76, 0.72, 0.8],
    radarNote: "当前状态：五行能量分布均衡，身心状态稳定。",
    sleep: [
      { name: "深睡", value: "2.5", width: "30%", color: "#10b981", cardClass: "sleep-card-left" },
      { name: "浅睡", value: "4.2", width: "51%", color: "#34d399", cardClass: "sleep-card-mid" },
      { name: "REM", value: "1.5", width: "19%", color: "#6ee7b7", cardClass: "sleep-card-right" }
    ],
    elements: [
      { name: "木 (Wood)", jade: "翠绿/碧玉", suitable: "精力旺盛、需疏导者", color: "#10b981", rowClass: "" },
      { name: "水 (Water)", jade: "墨翠/蓝水", suitable: "智谋深远、需沉静者", color: "#3b82f6", rowClass: "" },
      { name: "火 (Fire)", jade: "红翡/紫罗兰", suitable: "热情、需平衡躁动者", color: "#f43f5e", rowClass: "" },
      { name: "金 (Metal)", jade: "冰种/白底青", suitable: "果决、需柔和气场者", color: "#e2e8f0", rowClass: "" },
      { name: "土 (Earth)", jade: "黄翡/蜜糖", suitable: "稳重、需增强灵动者", color: "#d97706", rowClass: "element-row-last" }
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
    this.applyBirthProfile();
  },
  onShow() {
    this.applyBirthProfile();
  },
  goHome() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/home/index"
    });
  },
  goSettings() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/settings/index"
    });
  },
  openPeriodCalendar() {
    wx.navigateTo({
      url: "/subpackage/periodCalendar/pages/calendar/index"
    });
  },
  applyBirthProfile() {
    var profile = fiveElements.buildProfile(fiveElements.getSavedBirthInput());
    this.setData({
      focusElement: profile.focusElement,
      radarValues: profile.radarValues,
      radarNote: profile.radarNote,
      elements: profile.elements
    });
  }
});
