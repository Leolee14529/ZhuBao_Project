const i18n = require("../../../../utils/i18n");
Component({
  properties: { image: String, name: String, price: String, type: String, isNew: { type: Boolean, value: false } },
  data: { newLabel: i18n.t("home.new") },
  lifetimes: {
    attached() { this.unsubscribeLocale = i18n.subscribe(() => this.setData({ newLabel: i18n.t("home.new") })); },
    detached() { if (this.unsubscribeLocale) this.unsubscribeLocale(); }
  }
});
