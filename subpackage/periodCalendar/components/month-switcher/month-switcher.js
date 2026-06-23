Component({
  properties: {
    monthLabel: String,
    periodStartedToday: Boolean
  },
  methods: {
    onPrevTap() {
      this.triggerEvent("prev");
    },
    onNextTap() {
      this.triggerEvent("next");
    },
    onTodayTap() {
      this.triggerEvent("today");
    },
    onToggleTap(event) {
      const checked = event.detail && typeof event.detail.checked === "boolean"
        ? event.detail.checked
        : !this.properties.periodStartedToday;
      this.triggerEvent("toggle", {
        enabled: checked
      });
    }
  }
});
