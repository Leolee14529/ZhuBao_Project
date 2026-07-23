const i18n = require("../../../../utils/i18n");

Component({
  properties: {
    weeks: {
      type: Array,
      value: []
    }
  },
  data: {
    weekLabels: i18n.t("cycle.weekday")
  },
  lifetimes: {
    attached() {
      this.unsubscribeLocale = i18n.subscribe(() => this.setData({ weekLabels: i18n.t("cycle.weekday") }));
    },
    detached() { if (this.unsubscribeLocale) this.unsubscribeLocale(); }
  },
  methods: {
    onDayTap(event) {
      const { dateKey } = event.currentTarget.dataset;
      if (!dateKey) return;
      this.triggerEvent("selectday", { dateKey });
    }
  }
});
