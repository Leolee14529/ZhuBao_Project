const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    deviceStatus: "failed",
    infoRows: [
      { label: "Device Name", value: "No device", arrow: true },
      { label: "Device Model", value: "--", arrow: true },
      { label: "Firmware Version", value: "--", arrow: true },
      { label: "Serial Number", value: "--", arrow: true }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device12/assets/bluetooth-connected.png",
        label: "Bluetooth",
        value: "Disconnected",
        valueAlign: "right",
        danger: true,
        arrow: true
      }
    ]
  },

  onLoad() {
    this.updateSafeArea();
  },

  updateSafeArea() {
    this.setData({
      statusBarHeight: topLayout.getTopLayout().statusBarHeight
    });
  },

  onBackTap() {
    console.warn("[ROUTE]", "from subpackage/device12/pages/connected/index.js/onBackTap", "to", "/pages/home/index", "reason", "back to home");
    wx.reLaunch({
      url: "/pages/home/index"
    });
  },

  onDisconnect() {
    console.warn("[ROUTE]", "from subpackage/device12/pages/connected/index.js/onDisconnect", "to", "/subpackage/device17/pages/unconnected-detail/index", "reason", "disconnect device");
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
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
  },

  onReconnect() {
    console.warn("[ROUTE]", "from subpackage/device12/pages/connected/index.js/onReconnect", "to", "/subpackage/device17/pages/unconnected-detail/index", "reason", "reconnect device");
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  }
});
