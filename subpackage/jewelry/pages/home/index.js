var fiveElements = require("../../utils/five-elements");
var auth = require("../../../../utils/auth");
var share = require("../../../../utils/share");

Page({
  data: {
    topSpacer: 40,
    destinyLine: "暂无真实五行数据",
    customDesc: "暂无真实五行数据",
    device: {
      title: "设备",
      name: "暂无设备",
      status: "未连接",
      battery: "0%",
      batteryWidth: "0%"
    },
    leftProducts: [
      {
        image: "/subpackage/jewelry/assets/product-1.jpg",
        tag: "新品",
        cardClass: "product-card-tall"
      },
      {
        image: "/subpackage/jewelry/assets/product-3.jpg",
        tag: "",
        cardClass: "product-card-tall"
      }
    ],
    rightProducts: [
      {
        image: "/subpackage/jewelry/assets/product-2.jpg",
        tag: "",
        cardClass: "product-card-tall"
      },
      {
        image: "/subpackage/jewelry/assets/product-4.jpg",
        tag: "",
        cardClass: "product-card-tall"
      }
    ]
  },
  onLoad() {
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
    this.applyBirthProfile();
  },
  onShow() {
    this.applyBirthProfile();
  },
  onShareAppMessage() {
    return share.getHomeShareAppMessage();
  },
  onShareTimeline() {
    return share.getHomeShareTimeline();
  },
  goData() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },
  goSettings() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" })) return;
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/settings/index"
    });
  },
  openDevice() {
    wx.showToast({
      title: "功能暂未开放",
      icon: "none"
    });
  },
  openFiveElementCustomizer() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/five-elements/index" })) return;
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/five-elements/index"
    });
  },
  applyBirthProfile() {
    var profile = fiveElements.buildCurrentProfile();
    this.setData({
      destinyLine: profile.destinyLine,
      customDesc: profile.summaryText
    });
  }
});
