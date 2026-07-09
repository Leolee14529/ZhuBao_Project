Page({
  data: {
    statusBarHeight: 47,
    deviceStatus: "pairing",
    infoRows: [
      { label: "设备名称", value: "暂无设备", arrow: true },
      { label: "设备型号", value: "--", arrow: true },
      { label: "固件版本", value: "--", arrow: false },
      { label: "序列号", value: "--", arrow: false }
    ],
    connectionRows: [
      {
        icon: "/subpackage/device13/assets/bluetooth-connecting.png",
        label: "蓝牙连接",
        value: "正在连接",
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
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: info.statusBarHeight || 47
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
