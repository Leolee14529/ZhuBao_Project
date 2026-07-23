const i18n = require("../../../../utils/i18n");

Component({
  properties: {
    monthLabel: String,
    periodStartedToday: Boolean
  },
  data: { reminder: i18n.t("calendar.reminder") },
  lifetimes: {
    attached() { this.unsubscribeLocale = i18n.subscribe(() => this.setData({ reminder: i18n.t("calendar.reminder") })); },
    detached() { if (this.unsubscribeLocale) this.unsubscribeLocale(); }
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
