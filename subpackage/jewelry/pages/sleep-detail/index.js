var pageLayout = require("../../utils/page-layout");
var topLayout = require("../../../../utils/top-layout");

function formatDate(date) {
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    backButtonTop: topLayout.getTopLayout().backButtonTop,
    activeTab: "Day",
    date: "2026-07-11",
    sleep: {
      duration: "-- h -- min",
      sleepTime: "--",
      wakeTime: "--",
      score: "--",
      awakenings: "--"
    },
    stages: [
      { name: "Deep Sleep", value: "1 h 20 min", color: "#39d87a", width: "22%" },
      { name: "Light Sleep", value: "4 h 32 min", color: "#1fae70", width: "52%" },
      { name: "REM", value: "1 h 10 min", color: "#74e3ac", width: "18%" },
      { name: "Awake", value: "30 min", color: "#69736f", width: "8%" }
    ],
    quality: {
      score: "86 pts",
      efficiency: "92%",
      latency: "18 min",
      awakenings: "2 times"
    }
  },
  onLoad: function () {
    var topSpacer = pageLayout.getContentOffset(64);
    var backButtonTop = topLayout.getTopLayout().backButtonTop;
    this.setData({ topSpacer: topSpacer, backButtonTop: backButtonTop });
  },
  selectTab: function (e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },
  goBack: function () {
    wx.navigateBack();
  },
  handleBack: function () {
    wx.navigateBack();
  },
  shiftDate: function (e) {
    var offset = Number(e.currentTarget.dataset.offset);
    var current = new Date(this.data.date + "T00:00:00");
    current.setDate(current.getDate() + offset);
    this.setData({ date: formatDate(current) });
  }
});
