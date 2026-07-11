var pageLayout = require("../../utils/page-layout");

function formatDate(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    activeTab: "日",
    date: "2026-07-11",
    sleep: {
      duration: "--小时--分钟",
      sleepTime: "--",
      wakeTime: "--",
      score: "--",
      awakenings: "--"
    },
    stages: [
      { name: "深睡眠", value: "1小时20分钟", color: "#39d87a", width: "22%" },
      { name: "浅睡眠", value: "4小时32分钟", color: "#1fae70", width: "52%" },
      { name: "快速眼动", value: "1小时10分钟", color: "#74e3ac", width: "18%" },
      { name: "清醒", value: "30分钟", color: "#69736f", width: "8%" }
    ],
    quality: {
      score: "86分",
      efficiency: "92%",
      latency: "18分钟",
      awakenings: "2次"
    }
  },
  onLoad: function () {
    var topSpacer = pageLayout.getContentOffset(64);
    if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer: topSpacer });
  },
  selectTab: function (e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },
  goBack: function () {
    wx.navigateBack();
  },
  shiftDate: function (e) {
    var offset = Number(e.currentTarget.dataset.offset);
    var current = new Date(this.data.date + "T00:00:00");
    current.setDate(current.getDate() + offset);
    this.setData({ date: formatDate(current) });
  }
});
