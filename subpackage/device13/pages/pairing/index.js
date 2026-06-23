Page({
  data: {
    statusBarHeight: 47,
    deviceStatus: "pairing",
    infoRows: [
      { label: "设备名称", value: "Ting's Ring", arrow: true },
      { label: "设备型号", value: "Pro Model · Jade Edition", arrow: true },
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
    this.startSuccessTransition();
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
    this.successTimer = setTimeout(() => {
      wx.redirectTo({
        url: "/subpackage/device12/pages/connected/index"
      });
    }, 1800);
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

    wx.redirectTo({
      url: "/subpackage/device17/pages/unconnected-detail/index"
    });
  },

  onCapsuleTap() {
    wx.showToast({
      title: "更多功能待接入",
      icon: "none"
    });
  },

  onCancelConnect() {
    this.clearSuccessTimer();
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

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
