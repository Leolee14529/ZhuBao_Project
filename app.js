const config = require("./utils/config");

App({
  onLaunch() {
    console.log("[app:onLaunch]", {
      env: config.getEnvironment(),
      baseURL: config.getApiBaseUrl(),
      extConfig: config.getExternalConfig ? config.getExternalConfig() : {}
    });
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
      if (!wx.getWindowInfo) return fallback;
      const windowInfo = wx.getWindowInfo();
      const statusBarHeight = windowInfo.statusBarHeight || fallback.statusBarHeight;
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

      if (!menuButton || !menuButton.bottom) {
        return fallback;
      }

      return {
        statusBarHeight,
        menuTop: menuButton.top,
        menuHeight: menuButton.height,
        menuBottom: menuButton.bottom,
        contentOffset: Math.max(menuButton.bottom + 8, statusBarHeight + 44)
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
