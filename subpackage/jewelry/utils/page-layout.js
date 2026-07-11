function getContentOffset(fallback) {
  const fallbackValue = Number(fallback) > 0 ? Number(fallback) : 64;
  try {
    const app = getApp();
    const storedLayout = app && app.globalData ? app.globalData.navLayout : null;
    const liveLayout = app && app.getNavLayout ? app.getNavLayout() : null;
    const layout = liveLayout || storedLayout;
    const contentOffset = Number(layout && layout.contentOffset);
    return contentOffset > 0 ? contentOffset : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

module.exports = {
  getContentOffset
};
