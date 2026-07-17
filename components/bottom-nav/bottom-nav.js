const auth = require("../../utils/auth");
const i18n = require("../../utils/i18n");
const navigation = require("../../utils/navigation");

const routes = {
  home: "/pages/home/index",
  data: "/subpackage/jewelry/pages/data/index",
  settings: "/subpackage/jewelry/pages/settings/index"
};

Component({
  properties: {
    active: {
      type: String,
      value: "home"
    }
  },
  data: {
    tabs: []
  },
  observers: {
    active() {
      this.syncTabs();
    }
  },
  lifetimes: {
    attached() {
      this.syncTabs();
      this.unsubscribeLocale = i18n.subscribe(() => this.syncTabs());
    },
    detached() {
      if (this.unsubscribeLocale) this.unsubscribeLocale();
    }
  },
  methods: {
    syncTabs() {
      const tabs = ["home", "data", "settings"].map((id) => ({
        id,
        label: i18n.t("nav." + id),
        iconClass: "icon-" + (id === "data" ? "wave" : id === "settings" ? "gear" : "home"),
        itemClass: id === this.data.active ? "active" : ""
      }));
      this.setData({ tabs });
    },
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab || tab === this.data.active) return;
      if (tab !== "home" && !auth.requireLogin({
        source: routes[tab],
        reason: i18n.t("errors.loginRequired")
      })) {
        return;
      }
      navigation.navigateToPage(routes[tab]);
    }
  }
});
