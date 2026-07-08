var fiveElements = require("../../utils/five-elements");
var request = require("../../../../utils/request");
var auth = require("../../../../utils/auth");
var privacy = require("../../../../utils/privacy");
var share = require("../../../../utils/share");

Page({
  data: {
    topSpacer: 40,
    birthDate: "",
    birthTime: "",
    gender: "female",
    genderOptions: ["女", "男"],
    genderIndex: 0,
    isSaving: false,
    focusElement: "木",
    destinyLine: "",
    previewTags: []
  },

  onLoad: function () {
    share.enableShareMenu();
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/five-elements/index" })) return;
    var app = getApp();
    var navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    var birthInput = fiveElements.getSavedBirthInput();

    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }

    this.setData({
      birthDate: birthInput.date,
      birthTime: birthInput.time,
      gender: birthInput.gender,
      genderIndex: birthInput.gender === "male" ? 1 : 0
    });
    this.refreshPreview();
    this.loadLatestResult();
  },
  onShareAppMessage: function () { return share.getPageShareAppMessage("/subpackage/jewelry/pages/five-elements/index"); },
  onShareTimeline: function () { return share.getPageShareTimeline("/subpackage/jewelry/pages/five-elements/index"); },
  onShow: function () {
    auth.requireLogin({ source: "/subpackage/jewelry/pages/five-elements/index" });
  },

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
    this.setData({
      focusElement: profile.focusElement,
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
        title: "已更新参考",
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
        title: error && error.message ? error.message : "保存失败，请重试",
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
        title: "出生资料用途说明",
        content: "将保存出生日期、出生时间、性别，用于生成五行色彩和饰品风格参考；可在设置中删除；不作为健康判断或功效承诺。",
        confirmText: "同意保存",
        cancelText: "取消",
        success: function (res) {
          if (!res.confirm) {
            reject(new Error("已取消保存"));
            return;
          }
          auth.setPersonalData(auth.BIRTH_NOTICE_KEY, true);
          resolve(true);
        },
        fail: function () {
          reject(new Error("暂时无法保存，请稍后重试"));
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
    console.warn("[ROUTE]", "from subpackage/jewelry/pages/five-elements/index.js/goBack", "to", "/pages/home/index", "reason", "fallback back");
    wx.redirectTo({
      url: "/pages/home/index"
    });
  }
});
