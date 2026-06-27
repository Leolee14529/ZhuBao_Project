Page({
  goBack() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: "/pages/login/index" });
      }
    });
  }
});
