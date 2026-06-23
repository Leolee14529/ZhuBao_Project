var fiveElements = require("../../utils/five-elements");

Page({
  data: {
    topSpacer: 40,
    birthDate: "",
    birthTime: "",
    focusElement: "木",
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
      birthDate: birthInput.date,
      birthTime: birthInput.time
    });
    this.refreshPreview();
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

  refreshPreview: function () {
    var profile = fiveElements.buildProfile({
      date: this.data.birthDate,
      time: this.data.birthTime
    });

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

  saveBirthProfile: function () {
    fiveElements.saveBirthInput({
      date: this.data.birthDate,
      time: this.data.birthTime
    });
    wx.showToast({
      title: "已更新五行",
      icon: "success"
    });

    setTimeout(function () {
      if (getCurrentPages().length > 1) {
        wx.navigateBack({
          delta: 1
        });
        return;
      }
      wx.redirectTo({
        url: "/subpackage/jewelry/pages/data/index"
      });
    }, 450);
  },

  goBack: function () {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/home/index"
    });
  }
});
