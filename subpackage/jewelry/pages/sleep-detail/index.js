const auth = require("../../../../utils/auth");
const dailyCheckins = require("../../../../utils/daily-checkins");
const i18n = require("../../../../utils/i18n");
const recordViewModel = require("../../utils/daily-record-view-model");

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("sleepDetail"),
    date: "",
    sleep: "--",
    hasRecord: false,
    loading: true,
    loadError: ""
  },
  onLoad() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/sleep-detail/index" })) return;
    const app = getApp();
    const nav = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (nav && nav.contentOffset) this.setData({ topSpacer: nav.contentOffset });
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
    this.applyLocale();
  },
  onShow() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/sleep-detail/index" })) return;
    this.loadSleepRecord();
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  },
  applyLocale() {
    const copy = i18n.getCopy("sleepDetail");
    const dateKey = dailyCheckins.toDateKey();
    const sleep = this.currentCheckin
      ? recordViewModel.formatSleep(this.currentCheckin.sleepMinutes, copy)
      : copy.noRecord;
    this.setData({ copy, date: i18n.formatDateKey(dateKey), sleep });
  },
  loadSleepRecord() {
    const dateKey = dailyCheckins.toDateKey();
    this.setData({ loading: true, loadError: "" });
    dailyCheckins.listByDate(dateKey)
      .then((checkins) => {
        this.currentCheckin = checkins[0] || null;
        this.setData({
          loading: false,
          hasRecord: Boolean(this.currentCheckin),
          sleep: this.currentCheckin
            ? recordViewModel.formatSleep(this.currentCheckin.sleepMinutes, this.data.copy)
            : this.data.copy.noRecord
        });
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          this.setData({ loading: false });
          return;
        }
        this.currentCheckin = null;
        this.setData({ loading: false, hasRecord: false, loadError: this.data.copy.loadFailed, sleep: this.data.copy.noRecord });
      });
  },
  retryLoad() {
    this.loadSleepRecord();
  },
  goBack() {
    wx.navigateBack();
  }
});
