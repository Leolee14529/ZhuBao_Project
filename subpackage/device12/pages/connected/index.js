Page({
  data: {
    statusBarHeight: 47,
    deviceStatus: "failed",
    infoRows: [
      { label: "设备名称", value: "暂无设备", arrow: true },
      { label: "设备型号", value: "--", arrow: true },
      { label: "固件版本", value: "--", arrow: true },
      { label: "序列号", value: "--", arrow: true }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device12/assets/bluetooth-connected.png",
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
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: info.statusBarHeight || 47
    });
  },

  onBackTap() {
    console.warn("[ROUTE]", "from subpackage/device12/pages/connected/index.js/onBackTap", "to", "/pages/home/index", "reason", "back to home");
    wx.reLaunch({
      url: "/pages/home/index"
    });
  },

  onCapsuleTap() {
    wx.showToast({
      title: "更多功能待接入",
      icon: "none"
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
  },

  onReconnect() {
    console.warn("[ROUTE]", "from subpackage/device12/pages/connected/index.js/onReconnect", "to", "/subpackage/device17/pages/unconnected-detail/index", "reason", "reconnect device");
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  }
});
