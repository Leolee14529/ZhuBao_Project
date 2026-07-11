const routeDebug = require("./utils/route-debug");
const topLayout = require("./utils/top-layout");

App({
  onLaunch() {
    routeDebug.installRouteDebug();
    if (wx.setBackgroundColor) {
      wx.setBackgroundColor({
        backgroundColor: "#050505",
        backgroundColorTop: "#050505",
        backgroundColorBottom: "#050505"
      });
    }
    this.globalData.navLayout = this.getNavLayout();
  },
  getNavLayout() {
    return topLayout.getTopLayout();
  },
  globalData: {
    appName: "Ting's Computing Power Jewelry",
    navLayout: null
  }
});
