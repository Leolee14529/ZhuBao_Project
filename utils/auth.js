const LOGIN_URL = "/pages/login/index";
const HOME_URL = "/subpackage/jewelry/pages/home/index";

const TOKEN_KEY = "token";
const USER_KEY = "userInfo";
const GUEST_KEY = "guestMode";
const BIRTH_KEY = "jewelryBirthProfile";
const WUXING_KEY = "jewelryWuxingResult";
const CYCLE_KEY = "periodCalendarCycleProfile";
const PERIOD_PRIVACY_KEY = "periodPrivacyConfirmed";
const BIRTH_NOTICE_KEY = "birthProfileNoticeConfirmed";
const PRIVACY_CONSENT_KEY = "privacyConsentAccepted";

let isRedirectingToLogin = false;

function safeGet(key) {
  try {
    return wx.getStorageSync(key);
  } catch (error) {
    return "";
  }
}

function safeSet(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    // Local storage writes are best-effort.
  }
}

function safeRemove(key) {
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    // Local storage cleanup is best-effort.
  }
}

function getToken() {
  return safeGet(TOKEN_KEY) || "";
}

function clearGuestMode() {
  safeRemove(GUEST_KEY);
}

function enterGuestMode() {
  clearAuthState();
  safeSet(GUEST_KEY, true);
}

function getAuthState() {
  const token = getToken();
  if (token) {
    clearGuestMode();
    return { status: "loggedIn", token };
  }
  if (safeGet(GUEST_KEY) === true) {
    return { status: "guest", token: "" };
  }
  return { status: "anonymous", token: "" };
}

function isLoggedIn() {
  return getAuthState().status === "loggedIn";
}

function clearAuthState() {
  safeRemove(TOKEN_KEY);
  safeRemove(USER_KEY);
}

function clearCycleData() {
  safeRemove(CYCLE_KEY);
  safeRemove(PERIOD_PRIVACY_KEY);
}

function clearWuxingLocalData() {
  safeRemove(BIRTH_KEY);
  safeRemove(WUXING_KEY);
  safeRemove(BIRTH_NOTICE_KEY);
}

function clearAllLocalPersonalData() {
  clearAuthState();
  clearGuestMode();
  clearWuxingLocalData();
  clearCycleData();
  safeRemove(PRIVACY_CONSENT_KEY);
}

function acceptPrivacyConsent() {
  safeSet(PRIVACY_CONSENT_KEY, true);
}

function hasPrivacyConsent() {
  return safeGet(PRIVACY_CONSENT_KEY) === true;
}

function buildLoginUrl(source) {
  const allowRestore = source === "/subpackage/jewelry/pages/data/index" ||
    source === "/subpackage/jewelry/pages/settings/index" ||
    source === "/subpackage/jewelry/pages/five-elements/index";
  if (!allowRestore) return LOGIN_URL;
  return LOGIN_URL + "?redirect=" + encodeURIComponent(source);
}

function redirectToLogin(source) {
  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  clearAuthState();
  clearGuestMode();
  wx.reLaunch({
    url: buildLoginUrl(source),
    complete() {
      setTimeout(() => {
        isRedirectingToLogin = false;
      }, 300);
    }
  });
}

function requireLogin(options) {
  const opts = options || {};
  if (isLoggedIn()) return true;

  if (opts.redirectToLogin !== false) {
    wx.showToast({
      title: opts.reason || "请先登录后使用",
      icon: "none"
    });
    setTimeout(() => redirectToLogin(opts.source), 500);
  }
  return false;
}

module.exports = {
  LOGIN_URL,
  HOME_URL,
  TOKEN_KEY,
  USER_KEY,
  GUEST_KEY,
  BIRTH_KEY,
  WUXING_KEY,
  CYCLE_KEY,
  PERIOD_PRIVACY_KEY,
  BIRTH_NOTICE_KEY,
  PRIVACY_CONSENT_KEY,
  getToken,
  getAuthState,
  isLoggedIn,
  enterGuestMode,
  clearGuestMode,
  clearAuthState,
  clearCycleData,
  clearWuxingLocalData,
  clearAllLocalPersonalData,
  acceptPrivacyConsent,
  hasPrivacyConsent,
  redirectToLogin,
  requireLogin
};
