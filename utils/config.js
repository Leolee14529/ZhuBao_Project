const API_BASE_URLS = {
  development: "https://jewelry-api.birdai-glasses.com",
  trial: "https://jewelry-api.birdai-glasses.com",
  production: "https://jewelry-api.birdai-glasses.com"
};

function getEnvironment() {
  try {
    const account = wx.getAccountInfoSync();
    const version = account && account.miniProgram && account.miniProgram.envVersion;
    if (version === "release") return "production";
    if (version === "trial") return "trial";
  } catch (error) {
    // Development tools may not expose account information.
  }
  return "development";
}

function getExternalApiBaseUrl() {
  try {
    const config = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
    return config && config.apiBaseUrl ? String(config.apiBaseUrl) : "";
  } catch (error) {
    return "";
  }
}

function getApiBaseUrl() {
  const externalUrl = getExternalApiBaseUrl();
  if (externalUrl) return externalUrl.replace(/\/+$/, "");
  return API_BASE_URLS[getEnvironment()] || "";
}

module.exports = {
  API_BASE_URLS,
  getEnvironment,
  getApiBaseUrl
};
