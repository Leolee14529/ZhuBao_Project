var share = require("../../../../utils/share");

var HOME_URL = "/pages/home/index";

Page({
  data: {
    topSpacer: 40
  },

  onLoad: function () {
    share.enableShareMenu();
    this.returnHome();
  },
  onShow: function () {
    this.returnHome();
  },
  onShareAppMessage: function () {
    return share.getHomeShareAppMessage();
  },
  onShareTimeline: function () {
    return share.getHomeShareTimeline();
  },
  returnHome: function () {
    if (this.hasReturnedHome) return;
    this.hasReturnedHome = true;
    wx.reLaunch({
      url: HOME_URL,
      fail: function () {
        wx.redirectTo({
          url: HOME_URL
        });
      }
    });
  }
});
