const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    topSpacer: topLayout.getTopLayout().contentOffset,
    activeTab: "home",
    fortuneFlipped: false,
    stats: [
      { accent: "#87a9ff", title: "Today's Mood", value: "None", desc: "Heart Rate · 0 bpm" },
      { accent: "#ff7aa8", title: "Today's Element", value: "None", desc: "No element reference data" }
    ],
    device: {
      name: "No device",
      status: "Disconnected",
      battery: "0%",
      sync: "No sync data yet",
      metrics: [
        { label: "Temperature", value: "0°C" },
        { label: "Steps", value: "0" },
        { label: "Sleep", value: "0 h" }
      ]
    },
    products: [
      { image: "/subpackage/jewelry/assets/product-1.jpg", tag: "New" },
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
    wx.showToast({ title: "This demo only shows Home", icon: "none" });
  },
  handleViewAll() {
    wx.showToast({ title: "Product list is coming soon", icon: "none" });
  },
  handleDeviceTap() {
    wx.showToast({ title: "Device details are coming soon", icon: "none" });
  }
});
