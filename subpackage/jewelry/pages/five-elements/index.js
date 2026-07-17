var fiveElements = require("../../utils/five-elements");
var request = require("../../../../utils/request");
var auth = require("../../../../utils/auth");
var privacy = require("../../../../utils/privacy");
var i18n = require("../../../../utils/i18n");

Page({
  data: {
    topSpacer: 40,
    birthDate: "",
    birthTime: "",
    gender: "female",
    copy: i18n.getCopy("five"),
    genderOptions: [i18n.t("five.female"), i18n.t("five.male")],
    genderIndex: 0,
    isSaving: false,
    isLoggedIn: false,
    focusElement: i18n.t("elements.wood"),
    focusLabel: i18n.t("five.focus", { element: i18n.t("elements.wood") }),
    commonSaving: i18n.t("common.saving"),
    destinyLine: "",
    previewTags: []
  },

  onLoad: function () {
    var app = getApp();
    var navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    var birthInput = fiveElements.getSavedBirthInput();

    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }

    this.setData({
      isLoggedIn: auth.isLoggedIn(),
      birthDate: birthInput.date,
      birthTime: birthInput.time,
      gender: birthInput.gender,
      genderIndex: birthInput.gender === "male" ? 1 : 0
    });
    this.unsubscribeLocale = i18n.subscribe(() => { this.applyLocale(); this.refreshPreview(); });
    this.applyLocale();
    this.refreshPreview();
    this.loadLatestResult();
  },
  onShow: function () {
    this.setData({
      isLoggedIn: auth.isLoggedIn()
    });
    this.applyLocale();
  },
  onUnload: function () { if (this.unsubscribeLocale) this.unsubscribeLocale(); },

  onDateChange: function (event) {
    this.setData({
      birthDate: event.detail.value
    });
    this.refreshPreview();
  },

  onTimeChange: function (event) {
    this.setData({
      birthTime: event.detail.value
    });
    this.refreshPreview();
  },

  onGenderChange: function (event) {
    var genderIndex = Number(event.detail.value) || 0;
    this.setData({
      genderIndex: genderIndex,
      gender: genderIndex === 1 ? "male" : "female"
    });
    this.refreshPreview();
  },

  refreshPreview: function () {
    var birthInput = this.getCurrentBirthInput();
    var savedResult = fiveElements.getSavedWuxingResult();
    var profile = fiveElements.buildProfileForInput(birthInput, {
      result: savedResult,
      allowLocalFallback: false
    });

    this.applyPreviewProfile(profile);
    if (!fiveElements.isResultForBirthInput(savedResult, birthInput) &&
      auth.getPersonalData(auth.BIRTH_NOTICE_KEY) &&
      auth.hasPrivacyConsent()) {
      this.calculatePreview(birthInput);
    }
  },

  loadLatestResult: function () {
    request.get("/api/wuxing/latest")
      .then(function (data) {
        var result = data && data.result;
        if (!result) return;
        fiveElements.saveWuxingResult(result);
        this.setData({
          birthDate: result.birthDate,
          birthTime: result.birthTime,
          gender: result.gender,
          genderIndex: result.gender === "male" ? 1 : 0
        });
        this.refreshPreview();
      }.bind(this))
      .catch(function (error) {
        if (error && error.code === "WUXING_RESULT_NOT_FOUND") {
          auth.clearWuxingLocalData();
          this.refreshPreview();
          return;
        }
        if (error && error.statusCode !== 401) {
          console.error("load latest wuxing result failed", error);
        }
      }.bind(this));
  },

  getCurrentBirthInput: function () {
    return fiveElements.normalizeBirthInput({
      date: this.data.birthDate,
      time: this.data.birthTime,
      gender: this.data.gender
    });
  },

  applyPreviewProfile: function (profile) {
    profile = fiveElements.localizeProfile(profile);
    this.setData({
      focusElement: profile.focusElement,
      focusLabel: i18n.t("five.focus", { element: profile.focusElement }),
      destinyLine: profile.destinyLine,
      previewTags: profile.elements.slice(0, 5).map(function (item) {
        return {
          key: item.key,
          label: item.name,
          color: item.color
        };
      })
    });
  },

  calculatePreview: function (birthInput) {
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    var requestId = this.previewRequestId;

    request.post("/api/wuxing/calculate", {
      birthDate: birthInput.date,
      birthTime: birthInput.time,
      gender: birthInput.gender
    }).then(function (result) {
      if (requestId !== this.previewRequestId) return;
      var profile = fiveElements.buildProfileFromResult(result);
      if (profile) {
        this.applyPreviewProfile(profile);
      }
    }.bind(this)).catch(function (error) {
      if (error && error.statusCode === 401) return;
      console.error("calculate wuxing preview failed", error);
    });
  },

  saveBirthProfile: function () {
    if (this.data.isSaving) {
      return;
    }
    if (!auth.isLoggedIn()) {
      auth.requireLogin({
        source: "/subpackage/jewelry/pages/five-elements/index",
        reason: i18n.t("five.loginToSave")
      });
      return;
    }

    var birthInput = {
      date: this.data.birthDate,
      time: this.data.birthTime,
      gender: this.data.gender
    };
    privacy.checkWechatPrivacyReady({ action: "birthProfile" })
      .then(function () {
        return this.confirmBirthProfileNotice();
      }.bind(this))
      .then(function () {
        this.setData({ isSaving: true });
        return request.post("/api/wuxing/save", {
      birthDate: birthInput.date,
      birthTime: birthInput.time,
      gender: birthInput.gender
        });
      }.bind(this))
      .then(function (data) {
      fiveElements.saveBirthInput(birthInput);
      fiveElements.saveWuxingResult(data.result);
      wx.showToast({
        title: i18n.t("five.updated"),
        icon: "success"
      });
      setTimeout(function () {
        if (getCurrentPages().length > 1) {
          wx.navigateBack({ delta: 1 });
          return;
        }
        wx.redirectTo({
          url: "/subpackage/jewelry/pages/data/index"
        });
      }, 450);
    }).catch(function (error) {
      wx.showToast({
        title: error && error.message ? error.message : i18n.t("errors.saveFailed"),
        icon: "none"
      });
    }).then(function () {
      this.setData({ isSaving: false });
    }.bind(this));
  },
  confirmBirthProfileNotice: function () {
    if (auth.getPersonalData(auth.BIRTH_NOTICE_KEY)) {
      return Promise.resolve(true);
    }
    return new Promise(function (resolve, reject) {
      wx.showModal({
        title: i18n.t("five.noticeTitle"),
        content: i18n.t("five.noticeContent"),
        confirmText: i18n.t("five.consent"),
        cancelText: i18n.t("common.cancel"),
        success: function (res) {
          if (!res.confirm) {
            reject(new Error(i18n.t("five.cancelled")));
            return;
          }
          auth.setPersonalData(auth.BIRTH_NOTICE_KEY, true);
          resolve(true);
        },
        fail: function () {
          reject(new Error(i18n.t("five.unavailable")));
        }
      });
    });
  },

  goBack: function () {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    wx.redirectTo({
      url: "/pages/home/index"
    });
  },
  applyLocale: function () {
    var copy = i18n.getCopy("five");
    this.setData({
      copy: copy,
      commonSaving: i18n.t("common.saving"),
      focusLabel: i18n.t("five.focus", { element: this.data.focusElement }),
      genderOptions: [copy.female, copy.male]
    });
  }
});
