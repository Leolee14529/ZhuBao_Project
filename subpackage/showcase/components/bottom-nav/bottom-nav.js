Component({
  properties: {
    active: {
      type: String,
      value: "home"
    }
  },
  data: {
    tabs: [
      { id: "home", label: "首页", icon: "⌂" },
      { id: "health", label: "健康", icon: "〰" },
      { id: "settings", label: "设置", icon: "⚙" }
    ]
  },
  methods: {
    onTabTap(e) {
      const { tab } = e.currentTarget.dataset;
      this.triggerEvent("change", { tab });
    }
  }
});
