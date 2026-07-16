const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    deviceStatus: "unconnected",
    infoRows: [
      { label: "Device Name", value: "No device", arrow: true },
      { label: "Device Model", value: "--", arrow: true },
      { label: "Firmware Version", value: "--", arrow: false },
      { label: "Serial Number", value: "--", arrow: false }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device17/assets/bluetooth-icon.png",
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
    console.warn("[ROUTE]", "from subpackage/device17/pages/unconnected-detail/index.js/onBackTap", "to", "/pages/home/index", "reason", "back to home");
    wx.reLaunch({
      url: "/pages/home/index"
    });
  },

  onSearchDevice() {
    wx.navigateTo({
      url: "/subpackage/device13/pages/pairing/index"
    });
  },

  onEmptyAction() {
    this.onSearchDevice();
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
