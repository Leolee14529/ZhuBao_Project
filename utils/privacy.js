const PRIVACY_URL = "/pages/legal/privacy/index";
const auth = require("./auth");
const i18n = require("./i18n");

function showLocalPrivacy() {
  wx.navigateTo({
    url: PRIVACY_URL + "?mode=consent",
    fail() {
      wx.showToast({
        title: i18n.t("errors.privacyRead"),
        icon: "none"
      });
    }
  });
}

function openWechatPrivacyContract() {
  return new Promise((resolve, reject) => {
    if (!wx.openPrivacyContract) {
      showLocalPrivacy();
      reject(new Error(i18n.t("errors.privacyAgree")));
      return;
    }

    wx.openPrivacyContract({
      success: resolve,
      fail() {
        showLocalPrivacy();
        reject(new Error(i18n.t("errors.privacyAgree")));
      }
    });
  });
}

function requestWechatPrivacyAuthorization() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: i18n.t("settings.privacy"),
      content: i18n.t("login.agreementRequired"),
      confirmText: i18n.t("common.confirm"),
      cancelText: i18n.t("common.back"),
      success(res) {
        if (res.cancel) {
          openWechatPrivacyContract().catch(() => null);
          reject(new Error(i18n.t("errors.privacyAgree")));
          return;
        }
        if (!res.confirm) {
          reject(new Error(i18n.t("errors.privacyAgree")));
          return;
        }
        if (!wx.requirePrivacyAuthorize) {
          showLocalPrivacy();
          reject(new Error(i18n.t("errors.privacyAgree")));
          return;
        }
        wx.requirePrivacyAuthorize({
          success: resolve,
          fail() {
            showLocalPrivacy();
            reject(new Error(i18n.t("errors.privacyAgree")));
          }
        });
      },
      fail() {
        reject(new Error(i18n.t("errors.privacyAgree")));
      }
    });
  });
}

function checkWechatPrivacyReady(options) {
  const opts = options || {};
  if (opts.agreed === false) {
    return Promise.reject(new Error(i18n.t("login.agreementRequired")));
  }
  if (opts.action !== "login" && !auth.hasPrivacyConsent()) {
    showLocalPrivacy();
    return Promise.reject(new Error(i18n.t("login.agreementRequired")));
  }

  return new Promise((resolve, reject) => {
    if (!wx.getPrivacySetting) {
      showLocalPrivacy();
      reject(new Error(i18n.t("errors.privacyAgree")));
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
        reject(new Error(i18n.t("errors.privacyAgree")));
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
