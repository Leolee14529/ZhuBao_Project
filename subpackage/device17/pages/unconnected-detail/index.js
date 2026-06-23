Page({
  data: {
    statusBarHeight: 47,
    deviceStatus: "unconnected",
    infoRows: [
      { label: "设备名称", value: "Ting's Ring", arrow: true },
      { label: "设备型号", value: "Pro Model · Jade Edition", arrow: true },
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

  onSearchDevice() {
    wx.navigateTo({
      url: "/subpackage/device13/pages/pairing/index"
    });
  },

  onEmptyAction() {
    this.onSearchDevice();
  },

  onCapsuleTap() {
    wx.showToast({
      title: "更多功能待接入",
      icon: "none"
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
  }
});
