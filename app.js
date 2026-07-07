const routeDebug = require("./utils/route-debug");

App({
  onLaunch() {
    routeDebug.installRouteDebug();
    this.globalData.navLayout = this.getNavLayout();
  },
  getNavLayout() {
    const fallback = {
      statusBarHeight: 20,
      menuTop: 6,
      menuHeight: 32,
      menuBottom: 52,
      contentOffset: 52
    };

    try {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || fallback.statusBarHeight;
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

      if (!menuButton || !menuButton.bottom) {
        return fallback;
      }

      const liftedContentOffset = Math.max(menuButton.bottom - 10, statusBarHeight + 32);

      return {
        statusBarHeight,
        menuTop: menuButton.top,
        menuHeight: menuButton.height,
        menuBottom: menuButton.bottom,
        contentOffset: Math.round(liftedContentOffset)
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
