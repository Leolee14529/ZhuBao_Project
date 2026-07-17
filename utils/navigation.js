function navigateToPage(url) {
  if (!url || typeof wx === "undefined") return;

  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  const targetIndex = pages.findIndex((page) => {
    const route = page && page.route ? "/" + page.route.replace(/^\/+/, "") : "";
    return route === url.split("?")[0];
  });

  if (targetIndex >= 0) {
    const delta = pages.length - targetIndex - 1;
    if (delta > 0 && wx.navigateBack) {
      wx.navigateBack({ delta });
    }
    return;
  }

  wx.navigateTo({ url });
}

module.exports = { navigateToPage };
