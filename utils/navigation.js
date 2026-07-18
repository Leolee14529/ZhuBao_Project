const PAGE_ANIMATION_DURATION = 220;

function getPageStack() {
  return typeof getCurrentPages === "function" ? getCurrentPages() : [];
}

function findTargetIndex(pages, url) {
  const targetRoute = url.split("?")[0];
  return pages.findIndex((page) => {
    const route = page && page.route ? "/" + page.route.replace(/^\/+/, "") : "";
    return route === targetRoute;
  });
}

function navigateToPage(url) {
  if (!url || typeof wx === "undefined") return;

  const pages = getPageStack();
  const targetIndex = findTargetIndex(pages, url);

  if (targetIndex >= 0) {
    const delta = pages.length - targetIndex - 1;
    if (delta > 0 && wx.navigateBack) {
      wx.navigateBack({
        delta,
        animationType: "slide-out-right",
        animationDuration: PAGE_ANIMATION_DURATION
      });
    }
    return;
  }

  wx.navigateTo({
    url,
    animationType: "slide-in-right",
    animationDuration: PAGE_ANIMATION_DURATION
  });
}

function replacePage(url) {
  if (!url || typeof wx === "undefined") return Promise.resolve();

  const pages = getPageStack();
  const targetIndex = findTargetIndex(pages, url);
  return new Promise((resolve, reject) => {
    if (targetIndex >= 0) {
      const delta = pages.length - targetIndex - 1;
      if (delta <= 0) {
        resolve();
        return;
      }
      wx.navigateBack({
        delta,
        animationType: "slide-out-right",
        animationDuration: PAGE_ANIMATION_DURATION,
        success: resolve,
        fail: reject
      });
      return;
    }

    wx.redirectTo({ url, success: resolve, fail: reject });
  });
}

module.exports = { navigateToPage, replacePage };
