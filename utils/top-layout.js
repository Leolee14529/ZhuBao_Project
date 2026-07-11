function getTopLayout() {
  const fallback = {
    statusBarHeight: 20,
    menuTop: 6,
    menuHeight: 32,
    menuBottom: 52,
    contentOffset: 64,
    headerTop: 64,
    topbarHeight: 64,
    backButtonTop: 28
  };

  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const statusBarHeight = Number(info.statusBarHeight) || fallback.statusBarHeight;
    const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const menuTop = menuButton && menuButton.top ? menuButton.top : fallback.menuTop;
    const menuHeight = menuButton && menuButton.height ? menuButton.height : fallback.menuHeight;
    const menuBottom = menuButton && menuButton.bottom ? menuButton.bottom : fallback.menuBottom;
    const contentOffset = Math.round(Math.max(menuBottom + 12, statusBarHeight + 48));
    const topbarHeight = Math.round(Math.max(menuBottom + 8, statusBarHeight + 44));
    const backButtonHeight = 56 * ((info.windowWidth || 375) / 750);

    return {
      statusBarHeight,
      menuTop,
      menuHeight,
      menuBottom,
      contentOffset,
      headerTop: contentOffset,
      topbarHeight,
      backButtonTop: Math.round(menuTop + (menuHeight - backButtonHeight) / 2 + 2)
    };
  } catch (error) {
    return fallback;
  }
}

module.exports = {
  getTopLayout
};
