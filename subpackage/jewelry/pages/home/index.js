var fiveElements = require("../../utils/five-elements");

Page({
  data: {
    topSpacer: 40,
    divinationClass: "",
    destinyLine: "金龙之命 · 阳土入格",
    customDesc: "基于您的命理专属打造",
    device: {
      title: "设备",
      name: "Ting's Ring",
      status: "已连接",
      battery: "78%"
    },
    leftProducts: [
      {
        image: "/subpackage/jewelry/assets/product-1.webp",
        tag: "新品",
        cardClass: "product-card-tall"
      },
      {
        image: "/subpackage/jewelry/assets/product-3.webp",
        tag: "",
        cardClass: "product-card-tall"
      }
    ],
    rightProducts: [
      {
        image: "/subpackage/jewelry/assets/product-2.webp",
        tag: "",
        cardClass: "product-card-tall"
      },
      {
        image: "/subpackage/jewelry/assets/product-4.webp",
        tag: "",
        cardClass: "product-card-tall"
      }
    ]
  },
  onLoad() {
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
  toggleDivination() {
    let nextClass = "divination-card-flipped";
    if (this.data.divinationClass) {
      nextClass = "";
    }
    this.setData({
      divinationClass: nextClass
    });
  },
  goData() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },
  goSettings() {
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/settings/index"
    });
  },
  openDevice() {
    wx.navigateTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  },
  openFiveElementCustomizer() {
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/five-elements/index"
    });
  },
  applyBirthProfile() {
    var profile = fiveElements.buildProfile(fiveElements.getSavedBirthInput());
    this.setData({
      destinyLine: profile.destinyLine,
      customDesc: profile.summaryText
    });
  }
});
