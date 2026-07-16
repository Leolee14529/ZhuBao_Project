const HOME_URL = "/pages/home/index";

function getButtonTop() {
  const fallback = 28;

  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const windowWidth = Number(info.windowWidth) || 375;
    const buttonSizePx = 88 * windowWidth / 750;
    const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

    if (menuButton && typeof menuButton.top === "number" && typeof menuButton.height === "number") {
      return Math.round(menuButton.top + (menuButton.height - buttonSizePx) / 2);
    }

    const statusBarHeight = Number(info.statusBarHeight) || 20;
    return Math.round(statusBarHeight + 4);
  } catch (error) {
    return fallback;
  }
}

Component({
  properties: {
    mode: {
      type: String,
      value: "back"
    },
    ariaLabel: {
      type: String,
      value: ""
    }
  },

  data: {
    buttonTop: getButtonTop(),
    computedLabel: "Back"
  },

  lifetimes: {
    attached() {
      const label = this.properties.ariaLabel ||
        (this.properties.mode === "home" ? "Back to Home" : "Back");
      this.setData({
        buttonTop: getButtonTop(),
        computedLabel: label
      });
    }
  },

  methods: {
    updateLayout() {
      this.setData({ buttonTop: getButtonTop() });
    },

    updateLabel() {
      const label = this.properties.ariaLabel ||
        (this.properties.mode === "home" ? "Back to Home" : "Back");
      if (label !== this.data.computedLabel) this.setData({ computedLabel: label });
    },

    onTap() {
      if (this.isNavigating) return;
      this.isNavigating = true;
      setTimeout(() => {
        this.isNavigating = false;
      }, 450);

      if (this.properties.mode === "home") {
        wx.reLaunch({ url: HOME_URL });
        return;
      }

      const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 });
        return;
      }

      wx.reLaunch({ url: HOME_URL });
    }
  }
});
