const API_BASE_URLS = {
  development: "http://192.168.3.60:3000",
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
  const config = getExternalConfig();
  return config && config.apiBaseUrl ? String(config.apiBaseUrl) : "";
}

function getExternalConfig() {
  try {
    return wx.getExtConfigSync ? wx.getExtConfigSync() : {};
  } catch (error) {
    return {};
  }
}

function getApiBaseUrl() {
  const env = getEnvironment();
  const baseUrl = API_BASE_URLS[env] || "";
  console.log("[config] env:", env);
  console.log("[config] baseURL:", baseUrl);
  return baseUrl;
}

function readBooleanFlag(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return value === true || value === "true" || value === 1 || value === "1";
}

function isAccountAuthEnabled() {
  const config = getExternalConfig();
  return readBooleanFlag(config && config.enableAccountAuth, true);
}

module.exports = {
  API_BASE_URLS,
  getEnvironment,
  getApiBaseUrl,
  getExternalConfig,
  isAccountAuthEnabled
};
