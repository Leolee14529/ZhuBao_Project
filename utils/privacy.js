const PRIVACY_URL = "/pages/legal/privacy/index";
const auth = require("./auth");

function showLocalPrivacy() {
  wx.navigateTo({
    url: PRIVACY_URL + "?mode=consent",
    fail() {
      wx.showToast({
        title: "请先阅读隐私政策",
        icon: "none"
      });
    }
  });
}

function openWechatPrivacyContract() {
  return new Promise((resolve, reject) => {
    if (!wx.openPrivacyContract) {
      showLocalPrivacy();
      reject(new Error("当前微信版本暂不支持打开官方隐私指引"));
      return;
    }

    wx.openPrivacyContract({
      success: resolve,
      fail() {
        showLocalPrivacy();
        reject(new Error("微信隐私保护指引暂时无法打开"));
      }
    });
  });
}

function requestWechatPrivacyAuthorization() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: "隐私保护提示",
      content: "继续使用前，请先阅读并同意微信隐私保护指引和海米算力隐私政策。",
      confirmText: "同意",
      cancelText: "查看",
      success(res) {
        if (res.cancel) {
          openWechatPrivacyContract().catch(() => null);
          reject(new Error("请先同意隐私保护指引"));
          return;
        }
        if (!res.confirm) {
          reject(new Error("请先同意隐私保护指引"));
          return;
        }
        if (!wx.requirePrivacyAuthorize) {
          showLocalPrivacy();
          reject(new Error("当前微信版本暂不支持隐私授权，请升级微信后重试"));
          return;
        }
        wx.requirePrivacyAuthorize({
          success: resolve,
          fail() {
            showLocalPrivacy();
            reject(new Error("请先同意隐私保护指引"));
          }
        });
      },
      fail() {
        reject(new Error("隐私授权暂时不可用，请稍后再试"));
      }
    });
  });
}

function checkWechatPrivacyReady(options) {
  const opts = options || {};
  if (opts.agreed === false) {
    return Promise.reject(new Error("请先阅读并同意用户协议与隐私政策"));
  }
  if (opts.action !== "login" && !auth.hasPrivacyConsent()) {
    showLocalPrivacy();
    return Promise.reject(new Error("请先重新同意用户协议与隐私政策"));
  }

  return new Promise((resolve, reject) => {
    if (!wx.getPrivacySetting) {
      showLocalPrivacy();
      reject(new Error("当前微信版本暂不支持隐私授权，请升级微信后重试"));
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
        reject(new Error("隐私授权状态获取失败，请稍后重试"));
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
