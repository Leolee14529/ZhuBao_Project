App({
  onLaunch() {
    this.globalData.navLayout = this.getNavLayout();
  },
  getNavLayout() {
    const fallback = {
      statusBarHeight: 20,
      menuTop: 6,
      menuHeight: 32,
      menuBottom: 52,
      contentOffset: 40
    };

    try {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || fallback.statusBarHeight;
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

      if (!menuButton || !menuButton.bottom) {
        return fallback;
      }

      return {
        statusBarHeight,
        menuTop: menuButton.top,
        menuHeight: menuButton.height,
        menuBottom: menuButton.bottom,
        contentOffset: Math.max(menuButton.bottom - statusBarHeight + 8, 40)
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
