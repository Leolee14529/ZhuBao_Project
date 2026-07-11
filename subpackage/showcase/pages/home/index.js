const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    topSpacer: topLayout.getTopLayout().contentOffset,
    activeTab: "home",
    fortuneFlipped: false,
    stats: [
      { accent: "#87a9ff", title: "今日心情", value: "暂无", desc: "心率 · 0 bpm" },
      { accent: "#ff7aa8", title: "今日元素", value: "无", desc: "暂无元素参考数据" }
    ],
    device: {
      name: "暂无设备",
      status: "未连接",
      battery: "0%",
      sync: "暂无同步数据",
      metrics: [
        { label: "体温", value: "0°C" },
        { label: "步数", value: "0" },
        { label: "睡眠", value: "0 h" }
      ]
    },
    products: [
      { image: "/subpackage/jewelry/assets/product-1.jpg", tag: "新款" },
      { image: "/subpackage/jewelry/assets/product-2.jpg", tag: "" }
    ]
  },
  onLoad() {
    const topSpacer = topLayout.getTopLayout().contentOffset;
    if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer });
  },
  handleFortuneToggle() {
    this.setData({ fortuneFlipped: !this.data.fortuneFlipped });
  },
  handleTabChange(e) {
    const { tab } = e.detail;
    if (!tab || tab === this.data.activeTab) return;
    wx.showToast({ title: "演示页仅展示首页", icon: "none" });
  },
  handleViewAll() {
    wx.showToast({ title: "产品列表待接入", icon: "none" });
  },
  handleDeviceTap() {
    wx.showToast({ title: "设备详情待接入", icon: "none" });
  }
});
