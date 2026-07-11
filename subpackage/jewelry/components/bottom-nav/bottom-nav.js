const auth = require("../../../../utils/auth");

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
    tabs: [
      { id: "home", label: "首页", iconClass: "icon-home" },
      { id: "data", label: "记录", iconClass: "icon-wave" },
      { id: "settings", label: "设置", iconClass: "icon-gear" }
    ]
  },
  methods: {
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab || tab === this.data.active || this._isNavigating) return;
      if (tab !== "home" && !auth.requireLogin({
        source: routes[tab],
        reason: "请先登录后使用"
      })) {
        return;
      }
      this._isNavigating = true;
      console.warn("[ROUTE]", "from subpackage/jewelry/components/bottom-nav/bottom-nav.js/switchTab", "to", routes[tab], "reason", "bottom nav switch");
      wx.redirectTo({
        url: routes[tab],
        fail: () => {
          this._isNavigating = false;
        }
      });
    }
  }
});
