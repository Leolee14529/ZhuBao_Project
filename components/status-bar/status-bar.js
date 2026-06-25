Component({
  data: { time: "09:41" },
  lifetimes: {
    attached() {
      this.updateTime();
      this.timer = setInterval(() => this.updateTime(), 30000);
    },
    detached() {
      if (this.timer) clearInterval(this.timer);
    }
  },
  methods: {
    updateTime() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      this.setData({ time: `${h}:${m}` });
    }
  }
});