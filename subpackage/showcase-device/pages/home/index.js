Page({
  data: {
    topSpacer: 40,
    activeTab: "home",
    fortuneFlipped: false,
    stats: [
      {
        accent: "#87a9ff",
        title: "今日心情",
        value: "平静",
        desc: "心率平稳 · 68 bpm"
      },
      {
        accent: "#ff7aa8",
        title: "幸运元素",
        value: "火 (Fire)",
        desc: "宜穿红/紫色系"
      }
    ],
    device: {
      name: "Ting's Ring S1",
      status: "已连接",
      battery: "82%",
      sync: "2 分钟前同步",
      metrics: [
        { label: "体温", value: "36.5°C" },
        { label: "步数", value: "8,621" },
        { label: "睡眠", value: "8.2 h" }
      ]
    },
    products: [
      {
        image: "/subpackage/jewelry/assets/product-1.webp",
        tag: "新品"
      },
      {
        image: "/subpackage/jewelry/assets/product-2.webp",
        tag: ""
      }
    ]
  },
  onLoad() {
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({ topSpacer: navLayout.contentOffset });
    }
  },
  handleFortuneToggle() {
    this.setData({
      fortuneFlipped: !this.data.fortuneFlipped
    });
  },
  handleTabChange(e) {
    const { tab } = e.detail;
    if (!tab || tab === this.data.activeTab) {
      return;
    }
    wx.showToast({
      title: "演示页仅开放首页",
      icon: "none"
    });
  },
  handleViewAll() {
    wx.showToast({
      title: "产品列表待接入",
      icon: "none"
    });
  },
  handleDeviceTap() {
    wx.showToast({
      title: "设备详情待接入",
      icon: "none"
    });
  }
});
