Component({
  data: {
    height: 20
  },
  lifetimes: {
    attached() {
      try {
        const info = wx.getSystemInfoSync();
        this.setData({ height: info.statusBarHeight || 20 });
      } catch (error) {
        this.setData({ height: 20 });
      }
    }
  }
});
