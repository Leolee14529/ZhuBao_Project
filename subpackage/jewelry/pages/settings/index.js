const request = require("../../../../utils/request");
const auth = require("../../../../utils/auth");
const privacy = require("../../../../utils/privacy");
const i18n = require("../../../../utils/i18n");
const navigation = require("../../../../utils/navigation");
const settingsViewModel = require("../../utils/settings-view-model");

Page({
  data: {
    topSpacer: 40,
    locale: i18n.getLocale(),
    copy: i18n.getCopy("settings"),
    currentLanguage: i18n.t("settings.chinese"),
    languageExpanded: false,
    isDeviceBound: false,
    profileTitle: i18n.t("profile.guest"),
    profileSuffix: "",
    ringStatus: i18n.t("settings.disconnected"),
    avatarLetter: "U",
    isLoggingOut: false,
    sections: settingsViewModel.buildSections(i18n.getCopy("settings"))
  },
  onLoad() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" })) return;
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
    this.applyLocale();
    this.loadCurrentUser();
  },
  onShow() {
    auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" });
    this.applyLocale();
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  },
  applyLocale() {
    const locale = i18n.getLocale();
    const copy = i18n.getCopy("settings", locale);
    this.setData({
      locale,
      copy,
      currentLanguage: locale === "en-US" ? copy.english : copy.chinese,
      profileTitle: this.data.profileSuffix ? i18n.t("profile.user", { suffix: this.data.profileSuffix }, locale) : i18n.t("profile.guest", null, locale),
      ringStatus: this.data.isDeviceBound ? copy.connected : copy.disconnected,
      sections: settingsViewModel.buildSections(copy)
    });
    if (!this.unsubscribeLocale) {
      this.unsubscribeLocale = i18n.subscribe((nextLocale) => {
        const nextCopy = i18n.getCopy("settings", nextLocale);
        this.setData({
          locale: nextLocale,
          copy: nextCopy,
          currentLanguage: nextLocale === "en-US" ? nextCopy.english : nextCopy.chinese,
          profileTitle: this.data.profileSuffix ? i18n.t("profile.user", { suffix: this.data.profileSuffix }, nextLocale) : i18n.t("profile.guest", null, nextLocale),
          ringStatus: this.data.isDeviceBound ? nextCopy.connected : nextCopy.disconnected,
          sections: settingsViewModel.buildSections(nextCopy)
        });
      });
    }
  },
  loadCurrentUser() {
    request.get("/api/users/me")
      .then((data) => {
        const user = data.user || {};
        const suffix = String(user.id || "").slice(-6);
        const title = i18n.t("profile.user", { suffix });
        this.setData({
          profileTitle: title,
          profileSuffix: suffix,
          avatarLetter: title.charAt(0).toUpperCase() || "U"
        });
        wx.setStorageSync("userInfo", user);
      })
      .catch((error) => {
        console.error("load current user failed", error);
      });
  },
  goHome() {
    navigation.navigateToPage("/pages/home/index");
  },
  goData() {
    navigation.navigateToPage("/subpackage/jewelry/pages/data/index");
  },
  logout() {
    if (this.data.isLoggingOut) return;
    this.setData({ isLoggingOut: true });

    request.post("/api/auth/logout")
      .then(() => {
        request.clearAuthState();
        wx.reLaunch({
          url: "/pages/login/index"
        });
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          request.clearAuthState();
          wx.reLaunch({ url: "/pages/login/index" });
          return;
        }
        wx.showToast({
          title: error && error.message ? error.message : i18n.t("settings.logoutFailed"),
          icon: "none"
        });
        this.setData({ isLoggingOut: false });
      });
  },
  openAgreement() {
    wx.navigateTo({ url: "/pages/legal/agreement/index" });
  },
  openPrivacy() {
    wx.navigateTo({ url: "/pages/legal/privacy/index" });
  },
  openWechatPrivacy() {
    privacy.openWechatPrivacyContract().catch((error) => {
      wx.showToast({
        title: error && error.message ? error.message : i18n.t("errors.privacyAgree"),
        icon: "none"
      });
    });
  },
  clearCycleData() {
    wx.showModal({
      title: i18n.t("settings.clearCycleTitle"),
      content: i18n.t("settings.clearCycleContent"),
      confirmText: i18n.t("common.delete"),
      success: (res) => {
        if (!res.confirm) return;
        auth.clearCycleData();
        wx.showToast({ title: i18n.t("settings.clearCycleDone"), icon: "success" });
      }
    });
  },
  deleteWuxingProfile() {
    wx.showModal({
      title: i18n.t("settings.deleteBirthTitle"),
      content: i18n.t("settings.deleteBirthContent"),
      confirmText: i18n.t("common.delete"),
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/wuxing/profile")
          .then(() => {
            auth.clearWuxingLocalData();
            wx.showToast({ title: i18n.t("settings.deleteBirthDone"), icon: "success" });
          })
          .catch((error) => {
            wx.showToast({
              title: error && error.message ? error.message : i18n.t("settings.deleteFailed"),
              icon: "none"
            });
          });
      }
    });
  },
  withdrawConsent() {
    wx.showModal({
      title: i18n.t("settings.withdrawTitle"),
      content: i18n.t("settings.withdrawContent"),
      confirmText: i18n.t("settings.withdrawConsent"),
      success: (res) => {
        if (!res.confirm) return;
        request.post("/api/auth/logout").catch(() => null).then(() => {
          auth.clearAllLocalPersonalData();
          wx.reLaunch({ url: "/pages/login/index" });
        });
      }
    });
  },
  deleteAccount() {
    wx.showModal({
      title: i18n.t("settings.deleteAccountTitle"),
      content: i18n.t("settings.deleteAccountContent"),
      confirmText: i18n.t("common.delete"),
      success: (res) => {
        if (!res.confirm) return;
        request.delete("/api/users/me")
          .then((data) => {
            if (!data || data.deleted !== true) {
              throw new Error(i18n.t("settings.deleteFailed"));
            }
            auth.clearAllLocalPersonalData();
            wx.reLaunch({ url: "/pages/login/index" });
          })
          .catch((error) => {
            if (error && error.statusCode === 401) return;
            wx.showToast({
              title: error && error.message ? error.message : i18n.t("settings.deleteFailed"),
              icon: "none"
            });
          });
      }
    });
  },
  onSettingRowTap(event) {
    const { isLanguage, isRing } = event.currentTarget.dataset;
    if (isRing) {
      return;
    }
    if (isLanguage) {
      this.setData({ languageExpanded: !this.data.languageExpanded });
      return;
    }
  },
  selectLanguage(event) {
    const locale = event.currentTarget.dataset.locale;
    if (!locale) return;
    i18n.setLocale(locale);
    this.setData({ languageExpanded: false });
  }
});
