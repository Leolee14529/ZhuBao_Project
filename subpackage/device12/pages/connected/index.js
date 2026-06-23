Page({
  data: {
    statusBarHeight: 47,
    deviceStatus: "connected",
    infoRows: [
      { label: "设备名称", value: "Ting's Ring", arrow: true },
      { label: "设备型号", value: "Pro Model · Jade Edition", arrow: true },
      { label: "固件版本", value: "V1.2.8", noteDot: true, arrow: true },
      { label: "序列号", value: "TR2405001567", arrow: true }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device12/assets/bluetooth-connected.png",
        label: "蓝牙连接",
        value: "已连接",
        valueAlign: "right",
        brand: true,
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
    wx.reLaunch({
      url: "/subpackage/jewelry/pages/home/index"
    });
  },

  onCapsuleTap() {
    wx.showToast({
      title: "更多功能待接入",
      icon: "none"
    });
  },

  onDisconnect() {
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
    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  }
});
