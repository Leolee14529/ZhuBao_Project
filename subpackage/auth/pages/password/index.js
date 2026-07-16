const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    statusBarHeight: topLayout.getTopLayout().statusBarHeight,
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirm: false,
    errorText: "",
    agreed: false,
    serviceError: ""
  },

  onLoad() {
    this.setData({
      statusBarHeight: topLayout.getTopLayout().statusBarHeight
    });
  },

  onBackTap() {
    wx.navigateBack();
  },

  onPasswordInput(event) {
    this.setData({
      password: event.detail.value,
      errorText: "",
      serviceError: ""
    });
  },

  onConfirmInput(event) {
    this.setData({
      confirmPassword: event.detail.value,
      errorText: "",
      serviceError: ""
    });
  },

  onTogglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  onToggleConfirm() {
    this.setData({
      showConfirm: !this.data.showConfirm
    });
  },

  onAgreementToggle() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  onNext() {
    const { password, confirmPassword, agreed } = this.data;
    if (!agreed) {
      this.setData({
        errorText: "Please read and agree to the User Agreement and Privacy Policy first"
      });
      return;
    }
    if (password.length < 8 || password.length > 16) {
      this.setData({
        errorText: "Password must be 8-16 characters"
      });
      return;
    }
    if (password !== confirmPassword) {
      this.setData({
        errorText: "The two passwords do not match"
      });
      return;
    }
    console.warn("[ROUTE]", "from subpackage/auth/pages/password/index.js/submitPassword", "to", "/pages/home/index", "reason", "password submit success");
    wx.reLaunch({
      url: "/pages/home/index",
      fail: () => {
        this.setData({
          serviceError: "Cannot continue right now. Please try again later."
        });
      }
    });
  },
  retryNext() {
    this.onNext();
  }
});
