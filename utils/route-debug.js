const config = require("./config");

let installed = false;

function storageSnapshot() {
  return {
    hasToken: Boolean(wx.getStorageSync("token")),
    hasUserInfo: Boolean(wx.getStorageSync("userInfo"))
  };
}

function wrapNavigation(methodName) {
  const original = wx[methodName];
  if (typeof original !== "function") return;

  wx[methodName] = function (options = {}) {
    console.warn(`[ROUTE ${methodName}]`, {
      fromPages: getCurrentPages().map((page) => page.route),
      to: options.url,
      storage: storageSnapshot()
    });
    return original.call(wx, options);
  };
}

function installRouteDebug() {
  let enabled = false;
  try {
    enabled = wx.getStorageSync("routeDebugEnabled") === true;
  } catch (error) {
    enabled = false;
  }
  if (installed || config.getEnvironment() === "production" || !enabled) return;
  installed = true;
  ["reLaunch", "redirectTo", "navigateTo"].forEach(wrapNavigation);
}

module.exports = {
  installRouteDebug
};
