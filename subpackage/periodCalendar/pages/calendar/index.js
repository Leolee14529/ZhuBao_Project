const cycleEngine = require("../../utils/cycle-engine");
const cycleProfileService = require("../../utils/cycle-profile");
const auth = require("../../../../utils/auth"); const privacy = require("../../../../utils/privacy"); const share = require("../../../../utils/share"); const calendarState = require("./calendar-state");
Page({
  cycleStorageKey: auth.CYCLE_KEY,
  data: {
    weeks: [],
    cycleProfile: {},
    selectedDetail: null,
    calendarReady: false,
    showCycleSetup: false,
    cyclePrivacyConfirmed: false,
    isSavingCycle: false,
    legendItems: [{ key: "period", label: "周期" }, { key: "periodForecast", label: "参考周期" }, { key: "ovulation", label: "参考日" }, { key: "fertile", label: "参考窗口" }, { key: "safe", label: "其他日期" }]
  },
  onLoad() {
    share.enableShareMenu();
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    const profile = auth.getPersonalData(this.cycleStorageKey);
    setTimeout(() => {
      if (!this.data) return;
      this.setData(Object.assign(calendarState.create(profile), { calendarReady: true }));
    }, 0);
  },
  onShow() { auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" }); },
  onShareAppMessage() { return share.getPageShareAppMessage("/subpackage/periodCalendar/pages/calendar/index"); },
  onShareTimeline() { return share.getPageShareTimeline("/subpackage/periodCalendar/pages/calendar/index"); },
  refreshCalendar(year, month) {
    const monthLabel = cycleEngine.formatMonthLabel(year, month);
    const profile = cycleEngine.normalizeProfile(this.data.cycleProfile);
    const built = cycleEngine.buildWeeks(profile, year, month, this.data.selectedDateKey);
    if (!this.data.hasCycleData) {
      this.setData({
        monthLabel,
        weeks: built.weeks,
        selectedDetail: null,
        summaryDays: "--",
        summaryNextStart: "设置后生成周期参考"
      });
      return;
    }
    const todayDate = cycleEngine.getTodayDate();
    const summary = cycleEngine.buildSummary(built.cycleStarts, todayDate);
    const selectedDetail = cycleEngine.buildSelectedDetail(built.weeks, this.data.selectedDateKey, todayDate);
    this.setData({ monthLabel, weeks: built.weeks, selectedDetail, summaryDays: summary.daysUntil, summaryNextStart: summary.nextStartLabel });
  },
  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    console.warn("[ROUTE]", "from subpackage/periodCalendar/pages/calendar/index.js/onBackTap", "to", "/subpackage/jewelry/pages/data/index", "reason", "fallback back");
    wx.redirectTo({ url: "/subpackage/jewelry/pages/data/index" });
  },
  onPrevMonth() {
    let { viewYear, viewMonth } = this.data;
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    this.setData({ viewYear, viewMonth });
    this.refreshCalendar(viewYear, viewMonth);
  },
  onNextMonth() {
    let { viewYear, viewMonth } = this.data;
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    this.setData({ viewYear, viewMonth });
    this.refreshCalendar(viewYear, viewMonth);
  },
  onGoToday() {
    const today = cycleEngine.getTodayDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.setData({ viewYear: year, viewMonth: month, selectedDateKey: this.data.todayDateKey });
    this.refreshCalendar(year, month);
  },
  onSetupCycle() {
    this.setData({
      showCycleSetup: true,
      cyclePrivacyConfirmed: !!auth.getPersonalData(auth.PERIOD_PRIVACY_KEY),
      cycleProfile: cycleEngine.normalizeProfile(this.data.cycleProfile)
    });
  },
  onCloseCycleSetup() { this.setData({ showCycleSetup: false }); },
  onToggleCyclePrivacy() {
    this.setData({
      cyclePrivacyConfirmed: !this.data.cyclePrivacyConfirmed
    });
  },
  onSaveCycleSetup(event) {
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    if (this.data.isSavingCycle) return;
    const todayDate = cycleEngine.getTodayDate();
    const todayDateKey = this.data.todayDateKey;
    const sourceProfile = event && event.detail && event.detail.profile ?
      event.detail.profile :
      this.data.cycleProfile;
    const prepared = cycleProfileService.prepareSavedProfile(
      sourceProfile,
      todayDate
    );
    if (prepared.error) {
      wx.showToast({ title: prepared.error, icon: "none" });
      return;
    }
    const profile = prepared.profile;
    this.setData({ isSavingCycle: true });
    this.confirmCyclePrivacy()
      .then(() => privacy.checkWechatPrivacyReady({ action: "periodCalendar" }))
      .then(() => {
        auth.setPersonalData(this.cycleStorageKey, profile);
        auth.setPersonalData(auth.PERIOD_PRIVACY_KEY, true);
        this.setData({ hasCycleData: true, showCycleSetup: false, selectedDateKey: todayDateKey, cycleProfile: profile });
        this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
        wx.showToast({ title: "周期设置完成", icon: "success" });
      })
      .then(() => {
        this.setData({ isSavingCycle: false });
      })
      .catch((error) => {
        wx.showToast({
          title: error && error.message ? error.message : "请先确认周期数据说明",
          icon: "none"
        });
        this.setData({ isSavingCycle: false });
      });
  },
  confirmCyclePrivacy() {
    if (this.data.showCycleSetup) {
      return this.data.cyclePrivacyConfirmed ?
        Promise.resolve(true) :
        Promise.reject(new Error("请先勾选周期数据说明"));
    }
    if (this.data.cyclePrivacyConfirmed || auth.getPersonalData(auth.PERIOD_PRIVACY_KEY)) {
      return Promise.resolve(true);
    }
    if (!this.data.showCycleSetup) {
      this.setData({
        showCycleSetup: true,
        cyclePrivacyConfirmed: false
      });
    }
    return Promise.reject(new Error("请先勾选周期数据说明"));
  },
  ensureCyclePrivacyReady() {
    return this.confirmCyclePrivacy()
      .then(() => privacy.checkWechatPrivacyReady({ action: "periodCalendar" }))
      .then(() => {
        auth.setPersonalData(auth.PERIOD_PRIVACY_KEY, true);
        this.setData({ cyclePrivacyConfirmed: true });
      });
  },
  onToggleTodayPeriod(event) {
    const enabled = !!event.detail.enabled;
    const todayDateKey = this.data.todayDateKey;
    this.ensureCyclePrivacyReady().then(() => {
      const nextProfile = cycleEngine.normalizeProfile({
        lastPeriodDate: this.data.cycleProfile.lastPeriodDate || todayDateKey,
        cycleLength: this.data.cycleProfile.cycleLength,
        periodLength: this.data.cycleProfile.periodLength,
        todayPeriodStartEnabled: enabled,
        adjustments: enabled ? {} : this.data.cycleProfile.adjustments
      });
      auth.setPersonalData(this.cycleStorageKey, nextProfile);
      this.setData({
        hasCycleData: true,
        selectedDateKey: todayDateKey,
        cycleProfile: nextProfile
      });
      this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
    }).catch((error) => {
      wx.showToast({
        title: error && error.message ? error.message : "请先确认周期数据说明",
        icon: "none"
      });
    });
  },
  onSelectDay(event) {
    const { dateKey } = event.detail;
    if (!dateKey) return;
    this.setData({
      selectedDateKey: dateKey
    });
    this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
  },
  onAdjustPrediction() {
    const nextProfile = cycleProfileService.adjustPrediction(
      this.data.cycleProfile,
      this.data.selectedDetail,
      this.data.viewYear,
      this.data.viewMonth
    );
    if (!nextProfile) {
      wx.showToast({
        title: "当前日期无法调整参考日期",
        icon: "none"
      });
      return;
    }
    this.ensureCyclePrivacyReady().then(() => {
      auth.setPersonalData(this.cycleStorageKey, nextProfile);
      this.setData({
        cycleProfile: nextProfile
      });
      this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
      wx.showToast({
        title: "已更新后续参考日期",
        icon: "success"
      });
    }).catch((error) => {
      wx.showToast({
        title: error && error.message ? error.message : "请先确认周期数据说明",
        icon: "none"
      });
    });
  },
  onClearCycleData() {
    wx.showModal({
      title: "清除周期记录",
      content: "将清除本机保存的周期记录和确认状态，不会影响服务器账号。",
      confirmText: "清除",
      success: (res) => {
        if (!res.confirm) return;
        const todayDate = cycleEngine.getTodayDate();
        const todayDateKey = cycleEngine.formatDateKey(todayDate);
        const profile = cycleEngine.normalizeProfile({
          lastPeriodDate: todayDateKey,
          cycleLength: "28",
          periodLength: "5",
          todayPeriodStartEnabled: false,
          adjustments: {}
        });
        auth.clearCycleData();
        this.setData({
          hasCycleData: false,
          todayDateKey,
          selectedDateKey: todayDateKey,
          cyclePrivacyConfirmed: false,
          cycleProfile: profile
        });
        this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
        wx.showToast({ title: "已清除本机周期记录", icon: "success" });
      }
    });
  }
});
