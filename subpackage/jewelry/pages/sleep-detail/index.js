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
    rangeMode: "day",
    anchorDateKey: dailyCheckins.toDateKey(),
    trend: recordViewModel.buildSleepTrend([], dailyCheckins.toDateKey(), "day", i18n.getCopy("sleepDetail")),
    canMoveNext: false,
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
    const trend = recordViewModel.buildSleepTrend(this.currentCheckins || [], this.data.anchorDateKey, this.data.rangeMode, copy);
    this.setData({ copy, trend, date: this.formatRange(trend), sleep: this.getFocusedSleep(trend, copy) });
  },
  loadSleepRecord() {
    const range = recordViewModel.buildSleepRange(this.data.anchorDateKey, this.data.rangeMode);
    this.setData({ loading: true, loadError: "" });
    dailyCheckins.listRange(range.from, range.to, range.limit)
      .then((checkins) => {
        this.currentCheckins = checkins;
        const trend = recordViewModel.buildSleepTrend(checkins, this.data.anchorDateKey, this.data.rangeMode, this.data.copy);
        this.setData({
          loading: false,
          hasRecord: trend.hasRecords,
          trend,
          date: this.formatRange(trend),
          sleep: this.getFocusedSleep(trend, this.data.copy),
          canMoveNext: this.data.anchorDateKey < dailyCheckins.toDateKey()
        });
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          this.setData({ loading: false });
          return;
        }
        this.currentCheckins = [];
        this.setData({ loading: false, hasRecord: false, loadError: this.data.copy.loadFailed, sleep: this.data.copy.noRecord });
      });
  },
  changeRange(event) {
    const mode = event.currentTarget.dataset.mode;
    if (!mode || mode === this.data.rangeMode) return;
    this.setData({ rangeMode: mode }, () => this.loadSleepRecord());
  },
  moveRange(event) {
    const direction = Number(event.currentTarget.dataset.direction);
    if (direction > 0 && !this.data.canMoveNext) return;
    const amount = this.data.rangeMode === "month" ? 30 : this.data.rangeMode === "week" ? 7 : 1;
    const anchor = new Date(this.data.anchorDateKey + "T12:00:00");
    anchor.setDate(anchor.getDate() + direction * amount);
    const todayKey = dailyCheckins.toDateKey();
    const nextKey = dailyCheckins.toDateKey(anchor) > todayKey ? todayKey : dailyCheckins.toDateKey(anchor);
    this.setData({ anchorDateKey: nextKey }, () => this.loadSleepRecord());
  },
  formatRange(trend) {
    if (!trend || trend.from === trend.to) return i18n.formatDateKey(trend ? trend.to : this.data.anchorDateKey);
    return i18n.formatDateKey(trend.from) + " — " + i18n.formatDateKey(trend.to);
  },
  getFocusedSleep(trend, copy) {
    if (!trend || !trend.hasRecords) return copy.noRecord;
    if (this.data.rangeMode !== "day") return trend.averageSleep;
    const point = trend.points[trend.points.length - 1];
    return point && point.duration ? point.duration : copy.noRecord;
  },
  retryLoad() {
    this.loadSleepRecord();
  },
  goBack() {
    wx.navigateBack();
  }
});
