const PRIVACY_URL = "/pages/legal/privacy/index";
const auth = require("./auth");

function showLocalPrivacy() {
  wx.navigateTo({
    url: PRIVACY_URL + "?mode=consent",
    fail() {
      wx.showToast({
        title: "Please read the Privacy Policy first.",
        icon: "none"
      });
    }
  });
}

function openWechatPrivacyContract() {
  return new Promise((resolve, reject) => {
    if (!wx.openPrivacyContract) {
      showLocalPrivacy();
      reject(new Error("This WeChat version cannot open the official Privacy Guide."));
      return;
    }

    wx.openPrivacyContract({
      success: resolve,
      fail() {
        showLocalPrivacy();
        reject(new Error("The WeChat Privacy Guide cannot be opened right now."));
      }
    });
  });
}

function requestWechatPrivacyAuthorization() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: "Privacy Notice",
      content: "Before continuing, please read and agree to the WeChat Privacy Guide and Haimi Power Privacy Policy.",
      confirmText: "Agree",
      cancelText: "View",
      success(res) {
        if (res.cancel) {
          openWechatPrivacyContract().catch(() => null);
          reject(new Error("Please agree to the privacy notice first"));
          return;
        }
        if (!res.confirm) {
          reject(new Error("Please agree to the privacy notice first"));
          return;
        }
        if (!wx.requirePrivacyAuthorize) {
          showLocalPrivacy();
          reject(new Error("This WeChat version does not support privacy authorization. Please update WeChat and try again."));
          return;
        }
        wx.requirePrivacyAuthorize({
          success: resolve,
          fail() {
            showLocalPrivacy();
            reject(new Error("Please agree to the privacy notice first"));
          }
        });
      },
      fail() {
        reject(new Error("Privacy authorization is unavailable. Please try again later."));
      }
    });
  });
}

function checkWechatPrivacyReady(options) {
  const opts = options || {};
  if (opts.agreed === false) {
    return Promise.reject(new Error("Please read and agree to the User Agreement and Privacy Policy first"));
  }
  if (opts.action !== "login" && !auth.hasPrivacyConsent()) {
    showLocalPrivacy();
    return Promise.reject(new Error("Please agree to the User Agreement and Privacy Policy again"));
  }

  return new Promise((resolve, reject) => {
    if (!wx.getPrivacySetting) {
      showLocalPrivacy();
      reject(new Error("This WeChat version does not support privacy authorization. Please update WeChat and try again."));
      return;
    }

    wx.getPrivacySetting({
      success(res) {
        if (!res.needAuthorization) {
          resolve(true);
          return;
        }
        requestWechatPrivacyAuthorization().then(resolve).catch(reject);
      },
      fail() {
        showLocalPrivacy();
        reject(new Error("Failed to get privacy authorization status. Please try again later."));
      }
    });
  });
}

module.exports = {
  PRIVACY_URL,
  showLocalPrivacy,
  openWechatPrivacyContract,
  checkWechatPrivacyReady
};
