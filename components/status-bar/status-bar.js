function getStatusBarHeight() {
  try {
    const info = wx.getSystemInfoSync();
    const height = Number(info.statusBarHeight);
    return height > 0 ? height : 20;
  } catch (error) {
    return 20;
  }
}

Component({
  data: {
    height: getStatusBarHeight()
  },
  lifetimes: {
    attached() {
      const height = getStatusBarHeight();
      if (height !== this.data.height) this.setData({ height });
    }
  }
});
