const routeDebug = require("./utils/route-debug");

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
    const fallback = {
      statusBarHeight: 20,
      menuTop: 6,
      menuHeight: 32,
      menuBottom: 52,
      contentOffset: 64
    };

    try {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || fallback.statusBarHeight;
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

      if (!menuButton || !menuButton.bottom) {
        return fallback;
      }

      const safeContentOffset = Math.max(menuButton.bottom + 12, statusBarHeight + 48);

      return {
        statusBarHeight,
        menuTop: menuButton.top,
        menuHeight: menuButton.height,
        menuBottom: menuButton.bottom,
        contentOffset: Math.round(safeContentOffset)
      };
    } catch (error) {
      return fallback;
    }
  },
  globalData: {
    appName: "Ting's Computing Power Jewelry",
    navLayout: null
  }
});
