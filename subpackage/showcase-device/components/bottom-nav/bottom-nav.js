Component({
  properties: {
    active: {
      type: String,
      value: "home"
    }
  },
  data: {
    tabs: [
      { id: "home", label: "Home", icon: "⌂" },
      { id: "health", label: "Health", icon: "〰" },
      { id: "settings", label: "Settings", icon: "⚙" }
    ]
  },
  methods: {
    onTabTap(e) {
      const { tab } = e.currentTarget.dataset;
      this.triggerEvent("change", { tab });
    }
  }
});
