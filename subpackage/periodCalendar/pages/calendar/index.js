const cycleEngine = require("../../utils/cycle-engine");
const cycleProfileService = require("../../utils/cycle-profile");
const auth = require("../../../../utils/auth");
const privacy = require("../../../../utils/privacy");
Page({
  cycleStorageKey: "periodCalendarCycleProfile",
  data: {
    statusBarHeight: 47,
    topbarHeight: 52,
    backButtonTop: 26,
    monthLabel: "",
    viewYear: 0,
    viewMonth: 0,
    hasCycleData: false,
    showCycleSetup: false,
    todayDateKey: "",
    selectedDateKey: "",
    selectedDetail: null,
    summaryDays: "--",
    summaryNextStart: "暂无预测结果",
    cycleProfile: { lastPeriodDate: "", cycleLength: "28", periodLength: "5", todayPeriodStartEnabled: false, adjustments: {} },
    weeks: [],
    legendItems: [{ key: "period", label: "经期" }, { key: "periodForecast", label: "预测经期" }, { key: "ovulation", label: "排卵日" }, { key: "fertile", label: "易孕期" }, { key: "safe", label: "安全期" }]
  },
  onLoad() {
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    this.updateSafeArea();

    const todayDate = cycleEngine.getTodayDate();
    const todayDateKey = cycleEngine.formatDateKey(todayDate);
    const normalizedProfile = cycleEngine.normalizeProfile({ lastPeriodDate: todayDateKey, cycleLength: "28", periodLength: "5", todayPeriodStartEnabled: false, adjustments: {} });

    this.setData({ todayDateKey, selectedDateKey: todayDateKey, cycleProfile: normalizedProfile });

    this.loadCycleProfile();
    this.initializeViewMonth();
  },
  onShow() {
    auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" });
  },
  initializeViewMonth() {
    const today = cycleEngine.getTodayDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.setData({ viewYear: year, viewMonth: month });
    this.refreshCalendar(year, month);
  },
  updateSafeArea() {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const windowWidth = info.windowWidth || 375;
    const rpxToPx = windowWidth / 750;
    const backButtonHeight = 56 * rpxToPx;
    const statusBarHeight = info.statusBarHeight || 47;

    let topbarHeight = statusBarHeight + 44;
    let backButtonTop = statusBarHeight + 8;

    if (menuButton && menuButton.top) {
      topbarHeight = Math.max(menuButton.bottom + 8, statusBarHeight + 44);
      backButtonTop = menuButton.top + (menuButton.height - backButtonHeight) / 2 + 2;
    }

    this.setData({ statusBarHeight: statusBarHeight, topbarHeight: Math.round(topbarHeight), backButtonTop: Math.round(backButtonTop) });
  },
  loadCycleProfile() {
    const profile = wx.getStorageSync(this.cycleStorageKey);
    if (!profile) return;

    this.setData({ hasCycleData: true, cycleProfile: cycleEngine.normalizeProfile(profile) });
  },
  refreshCalendar(year, month) {
    const monthLabel = cycleEngine.formatMonthLabel(year, month);

    if (!this.data.hasCycleData) {
      this.setData({ monthLabel, weeks: [], selectedDetail: null, summaryDays: "--", summaryNextStart: "暂无预测结果" });
      return;
    }

    const built = cycleEngine.buildWeeks(this.data.cycleProfile, year, month, this.data.selectedDateKey);
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
  onCapsuleTap() {
    wx.showToast({ title: "更多功能待接入", icon: "none" });
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
    this.setData({ showCycleSetup: true });
  },

  noop() {},

  onCloseCycleSetup() {
    this.setData({ showCycleSetup: false });
  },

  onCycleDateChange(event) {
    this.setData({ "cycleProfile.lastPeriodDate": event.detail.value });
  },

  onCycleLengthInput(event) {
    const value = (event.detail.value || "").replace(/[^\d]/g, "").slice(0, 2);
    this.setData({ "cycleProfile.cycleLength": value });
  },

  onPeriodLengthInput(event) {
    const value = (event.detail.value || "").replace(/[^\d]/g, "").slice(0, 2);
    this.setData({ "cycleProfile.periodLength": value });
  },

  onSaveCycleSetup() {
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    const todayDate = cycleEngine.getTodayDate();
    const todayDateKey = this.data.todayDateKey;
    const prepared = cycleProfileService.prepareSavedProfile(
      this.data.cycleProfile,
      todayDate
    );
    if (prepared.error) {
      wx.showToast({ title: prepared.error, icon: "none" });
      return;
    }
    const profile = prepared.profile;

    this.confirmCyclePrivacy()
      .then(() => privacy.checkWechatPrivacyReady({ action: "periodCalendar" }))
      .then(() => {
        wx.setStorageSync(this.cycleStorageKey, profile);
        wx.setStorageSync(auth.PERIOD_PRIVACY_KEY, true);
    this.setData({
      hasCycleData: true,
      showCycleSetup: false,
      selectedDateKey: todayDateKey,
      cycleProfile: profile
    });
    this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
    wx.showToast({
      title: "周期设置完成",
      icon: "success"
    });
      })
      .catch((error) => {
        wx.showToast({
          title: error && error.message ? error.message : "请先确认经期数据说明",
          icon: "none"
        });
      });
  },
  confirmCyclePrivacy() {
    if (wx.getStorageSync(auth.PERIOD_PRIVACY_KEY)) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: "经期数据说明",
        content: "经期记录仅保存在本机，不上传服务器，不构成医疗、诊断、避孕、生育或健康建议。清除缓存或卸载可能导致数据丢失。",
        confirmText: "知晓并同意",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            resolve(true);
            return;
          }
          reject(new Error("请先确认经期数据说明"));
        },
        fail() {
          reject(new Error("请先确认经期数据说明"));
        }
      });
    });
  },

  onToggleTodayPeriod(event) {
    const enabled = !!event.detail.enabled;
    const todayDateKey = this.data.todayDateKey;
    const nextProfile = cycleEngine.normalizeProfile({
      lastPeriodDate: this.data.cycleProfile.lastPeriodDate || todayDateKey,
      cycleLength: this.data.cycleProfile.cycleLength,
      periodLength: this.data.cycleProfile.periodLength,
      todayPeriodStartEnabled: enabled,
      adjustments: enabled ? {} : this.data.cycleProfile.adjustments
    });

    wx.setStorageSync(this.cycleStorageKey, nextProfile);
    this.setData({
      hasCycleData: true,
      selectedDateKey: todayDateKey,
      cycleProfile: nextProfile
    });
    this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
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
        title: "当前日期无法调整预测",
        icon: "none"
      });
      return;
    }

    wx.setStorageSync(this.cycleStorageKey, nextProfile);
    this.setData({
      cycleProfile: nextProfile
    });
    this.refreshCalendar(this.data.viewYear, this.data.viewMonth);
    wx.showToast({
      title: "已重新预测后续周期",
      icon: "success"
    });
  }
});
