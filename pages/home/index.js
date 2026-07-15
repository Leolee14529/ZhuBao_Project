const SERVICE_HOME_URL = "/subpackage/jewelry/pages/home/index";

Page({
  data: {
    redirectFailed: false
  },
  onLoad() {
    this.openServiceHome();
  },
  openServiceHome() {
    this.setData({ redirectFailed: false });
    wx.reLaunch({
      url: SERVICE_HOME_URL,
      fail: () => {
        this.setData({ redirectFailed: true });
      }
    });
  }
});
