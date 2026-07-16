const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    deviceStatus: "pairing",
    infoRows: [
      { label: "Device Name", value: "No device", arrow: true },
      { label: "Device Model", value: "--", arrow: true },
      { label: "Firmware Version", value: "--", arrow: false },
      { label: "Serial Number", value: "--", arrow: false }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device13/assets/bluetooth-connecting.png",
        label: "Bluetooth",
        value: "Connecting",
        valueAlign: "right",
        brand: true,
        loading: true,
        arrow: false
      }
    ]
  },

  onLoad() {
    this.updateSafeArea();
  },

  onUnload() {
    this.clearSuccessTimer();
  },

  updateSafeArea() {
    this.setData({
      statusBarHeight: topLayout.getTopLayout().statusBarHeight
    });
  },

  startSuccessTransition() {
    this.clearSuccessTimer();
  },

  clearSuccessTimer() {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  },

  onBackTap() {
    this.clearSuccessTimer();
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    console.warn("[ROUTE]", "from subpackage/device13/pages/pairing/index.js/onBackTap", "to", "/subpackage/device17/pages/unconnected-detail/index", "reason", "fallback back");
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  },

  onCancelConnect() {
    this.clearSuccessTimer();
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    console.warn("[ROUTE]", "from subpackage/device13/pages/pairing/index.js/onCancelConnect", "to", "/subpackage/device17/pages/unconnected-detail/index", "reason", "fallback cancel");
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  },

  onRetryConnect() {
    this.setData({
      deviceStatus: "pairing"
    });
    this.startSuccessTransition();
  },

  onInfoSelect(event) {
    const { item } = event.detail;
    wx.showToast({
      title: item && item.label ? item.label : "Device Info",
      icon: "none"
    });
  },

  onConnectionSelect(event) {
    const { item } = event.detail;
    wx.showToast({
      title: item && item.label ? item.label : "Connection",
      icon: "none"
    });
  }
});
