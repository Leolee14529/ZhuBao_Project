const auth = require("../../../../utils/auth");

const routes = {
  home: "/subpackage/jewelry/pages/home/index",
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
    tabs: [
      { id: "home", label: "首页", iconClass: "icon-home", itemClass: "" },
      { id: "data", label: "记录", iconClass: "icon-wave", itemClass: "" },
      { id: "settings", label: "设置", iconClass: "icon-gear", itemClass: "" }
    ]
  },
  observers: {
    active() {
      this.syncTabs();
    }
  },
  lifetimes: {
    attached() {
      this.syncTabs();
    }
  },
  methods: {
    syncTabs() {
      const tabs = this.data.tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        iconClass: tab.iconClass,
        itemClass: tab.id === this.data.active ? "active" : ""
      }));
      this.setData({ tabs });
    },
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab || tab === this.data.active) return;
      if (tab !== "home" && !auth.requireLogin({
        source: routes[tab],
        reason: "请先登录后使用"
      })) {
        return;
      }
      console.warn("[ROUTE]", "from subpackage/jewelry/components/bottom-nav/bottom-nav.js/switchTab", "to", routes[tab], "reason", "bottom nav switch");
      wx.redirectTo({ url: routes[tab] });
    }
  }
});
