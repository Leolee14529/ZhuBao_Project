const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    deviceStatus: "unconnected",
    infoRows: [
      { label: "设备名称", value: "暂无设备", arrow: true },
      { label: "设备型号", value: "--", arrow: true },
      { label: "固件版本", value: "--", arrow: false },
      { label: "序列号", value: "--", arrow: false }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device17/assets/bluetooth-icon.png",
        label: "蓝牙连接",
        value: "未连接",
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
      title: item && item.label ? item.label : "设备信息",
      icon: "none"
    });
  },

  onConnectionSelect(event) {
    const { item } = event.detail;
    wx.showToast({
      title: item && item.label ? item.label : "连接管理",
      icon: "none"
    });
  }
});
