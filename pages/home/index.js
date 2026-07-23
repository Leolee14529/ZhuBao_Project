const share = require("../../utils/share");
const auth = require("../../utils/auth");
const dailyCheckins = require("../../utils/daily-checkins");
const i18n = require("../../utils/i18n");
const navigation = require("../../utils/navigation");
const homeInspiration = require("../../utils/home-inspiration");
const homeRecordState = require("../../utils/home-record-state");

function todayInspiration(locale) {
  return homeInspiration.getForDateKey(dailyCheckins.toDateKey(), locale);
}

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("home"),
    inspiration: todayInspiration(i18n.getLocale()),
    flipped: false,
    hasTodayRecord: false,
    dailyStatus: "idle",
    primaryAction: i18n.t("home.signInToRecord"),
    primaryActionDisabled: false,
    leftProducts: [
      { previewKey: "jade-circuit-collar-preview", id: "jade-circuit-collar", image: "/assets/products/product-1.jpg" },
      { previewKey: "jade-ring-lab-preview", id: "jade-ring-lab", image: "/assets/products/product-3.jpg" }
    ],
    rightProducts: [
      { previewKey: "hex-collar-preview", id: "hex-collar", image: "/assets/products/product-2.jpg" },
      { previewKey: "dark-jade-chip-front-preview", id: "dark-jade-chip", image: "/assets/products/product-4-brooch.jpg" },
      { previewKey: "dark-jade-chip-ring-preview", id: "dark-jade-chip", image: "/assets/products/product-4-ring.jpg" }
    ]
  },
  onLoad() {
    const referenceImages = this.data.leftProducts.concat(this.data.rightProducts);
    console.log("[style-reference:images]", referenceImages);
    console.log("[style-reference:src]", referenceImages.map((item) => item.image));
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
    const locale = i18n.getLocale();
    const copy = i18n.getCopy("home");
    const action = homeRecordState.buildAction({
      loggedIn: auth.isLoggedIn(),
      status: this.data.dailyStatus,
      hasRecord: this.data.hasTodayRecord
    }, copy);
    this.setData({
      copy,
      inspiration: todayInspiration(locale),
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
  },
  openProducts() {
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/products/index"
    });
  },
  openProduct(event) {
    const productId = event.currentTarget.dataset.id;
    if (!productId) return;
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/product-detail/index?id=" + encodeURIComponent(productId)
    });
  }
});
