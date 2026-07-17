const share = require("../../utils/share");
const auth = require("../../utils/auth");
const dailyCheckins = require("../../utils/daily-checkins");
const i18n = require("../../utils/i18n");
const navigation = require("../../utils/navigation");
const homeInspiration = require("../../utils/home-inspiration");
const homeRecordState = require("../../utils/home-record-state");

function todayInspiration() {
  return homeInspiration.getForDateKey(dailyCheckins.toDateKey());
}

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("home"),
    inspiration: todayInspiration(),
    flipped: false,
    hasTodayRecord: false,
    dailyStatus: "idle",
    primaryAction: i18n.t("home.signInToRecord"),
    primaryActionDisabled: false,
    leftProducts: [
      { image: "/subpackage/jewelry/assets/product-1.jpg", tag: "", cardClass: "product-card-tall" },
      { image: "/subpackage/jewelry/assets/product-3.jpg", tag: "", cardClass: "product-card-tall" }
    ],
    rightProducts: [
      { image: "/subpackage/jewelry/assets/product-2.jpg", tag: "", cardClass: "product-card-tall" },
      { image: "/subpackage/jewelry/assets/product-4.jpg", tag: "", cardClass: "product-card-tall" }
    ]
  },
  onLoad() {
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) this.setData({ topSpacer: navLayout.contentOffset });
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
    this.applyLocale();
  },
  onShow() {
    this.applyLocale();
    this.refreshDailyState();
  },
  onUnload() { if (this.unsubscribeLocale) this.unsubscribeLocale(); },
  onShareAppMessage() { return share.getHomeShareAppMessage(); },
  onShareTimeline() { return share.getHomeShareTimeline(); },
  applyLocale() {
    const copy = i18n.getCopy("home");
    const action = homeRecordState.buildAction({
      loggedIn: auth.isLoggedIn(),
      status: this.data.dailyStatus,
      hasRecord: this.data.hasTodayRecord
    }, copy);
    this.setData({
      copy,
      inspiration: { ...todayInspiration(), title: copy.inspirationTitle, color: copy.inspirationColor },
      primaryAction: action.label,
      primaryActionDisabled: action.disabled
    });
  },
  refreshDailyState() {
    if (!auth.isLoggedIn()) {
      this.setDailyAction("idle", false);
      return;
    }
    this.setDailyAction("loading", false);
    dailyCheckins.listByDate(dailyCheckins.toDateKey())
      .then((checkins) => {
        const hasTodayRecord = checkins.length > 0;
        this.setDailyAction("ready", hasTodayRecord);
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          this.setDailyAction("idle", false);
          return;
        }
        this.setDailyAction("error", false);
      });
  },
  setDailyAction(status, hasTodayRecord) {
    const action = homeRecordState.buildAction({
      loggedIn: auth.isLoggedIn(), status, hasRecord: hasTodayRecord
    }, this.data.copy);
    this.setData({
      dailyStatus: status,
      hasTodayRecord,
      primaryAction: action.label,
      primaryActionDisabled: action.disabled
    });
  },
  openDailyRecord() {
    if (this.data.primaryActionDisabled) return;
    const source = "/subpackage/jewelry/pages/data/index";
    if (!auth.requireLogin({ source })) return;
    navigation.navigateToPage(source);
  },
  toggleInspiration() {
    this.setData({ flipped: !this.data.flipped });
  }
});
