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
      { id: "home", label: "Home", iconClass: "icon-home" },
      { id: "data", label: "Records", iconClass: "icon-wave" },
      { id: "settings", label: "Settings", iconClass: "icon-gear" }
    ]
  },
  methods: {
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab || tab === this.data.active || this._isNavigating) return;
      if (tab !== "home" && !auth.requireLogin({
        source: routes[tab],
        reason: "Please log in to continue."
      })) {
        return;
      }
      this._isNavigating = true;
      wx.redirectTo({
        url: routes[tab],
        fail: () => {
          this._isNavigating = false;
        }
      });
    }
  }
});
