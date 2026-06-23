const cycleEngine = require("../../utils/cycle-engine");

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
    cycleProfile: {
      lastPeriodDate: "",
      cycleLength: "28",
      periodLength: "5",
      todayPeriodStartEnabled: false,
      adjustments: {}
    },
    weeks: [],
    legendItems: [
      { key: "period", label: "经期" },
      { key: "periodForecast", label: "预测经期" },
      { key: "ovulation", label: "排卵日" },
      { key: "fertile", label: "易孕期" },
      { key: "safe", label: "安全期" }
    ]
  },

  onLoad() {
    this.updateSafeArea();

    const todayDate = cycleEngine.getTodayDate();
    const todayDateKey = cycleEngine.formatDateKey(todayDate);
    const normalizedProfile = cycleEngine.normalizeProfile({
      lastPeriodDate: todayDateKey,
      cycleLength: "28",
      periodLength: "5",
      todayPeriodStartEnabled: false,
      adjustments: {}
    });

    this.setData({
      todayDateKey,
      selectedDateKey: todayDateKey,
      cycleProfile: normalizedProfile
    });

    this.loadCycleProfile();
    this.initializeViewMonth();
  },

  initializeViewMonth() {
    const today = cycleEngine.getTodayDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.setData({
      viewYear: year,
      viewMonth: month
    });
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

    this.setData({
      statusBarHeight: statusBarHeight,
      topbarHeight: Math.round(topbarHeight),
      backButtonTop: Math.round(backButtonTop)
    });
  },

  loadCycleProfile() {
    const profile = wx.getStorageSync(this.cycleStorageKey);
    if (!profile) return;

    this.setData({
      hasCycleData: true,
      cycleProfile: cycleEngine.normalizeProfile(profile)
    });
  },

  refreshCalendar(year, month) {
    const monthLabel = cycleEngine.formatMonthLabel(year, month);

    if (!this.data.hasCycleData) {
      this.setData({
        monthLabel,
        weeks: [],
        selectedDetail: null,
        summaryDays: "--",
        summaryNextStart: "暂无预测结果"
      });
      return;
    }

    const built = cycleEngine.buildWeeks(this.data.cycleProfile, year, month, this.data.selectedDateKey);
    const todayDate = cycleEngine.getTodayDate();
    const summary = cycleEngine.buildSummary(built.cycleStarts, todayDate);
    const selectedDetail = cycleEngine.buildSelectedDetail(built.weeks, this.data.selectedDateKey, todayDate);

    this.setData({
      monthLabel,
      weeks: built.weeks,
      selectedDetail,
      summaryDays: summary.daysUntil,
      summaryNextStart: summary.nextStartLabel
    });
  },

  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },

  onCapsuleTap() {
    wx.showToast({
      title: "更多功能待接入",
      icon: "none"
    });
  },

  onPrevMonth() {
    let { viewYear, viewMonth } = this.data;
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    this.setData({
      viewYear,
      viewMonth
    });
    this.refreshCalendar(viewYear, viewMonth);
  },

  onNextMonth() {
    let { viewYear, viewMonth } = this.data;
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    this.setData({
      viewYear,
      viewMonth
    });
    this.refreshCalendar(viewYear, viewMonth);
  },

  onGoToday() {
    const today = cycleEngine.getTodayDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    this.setData({
      viewYear: year,
      viewMonth: month,
      selectedDateKey: this.data.todayDateKey
    });
    this.refreshCalendar(year, month);
  },

  onSetupCycle() {
    this.setData({
      showCycleSetup: true
    });
  },

  noop() {},

  onCloseCycleSetup() {
    this.setData({
      showCycleSetup: false
    });
  },

  onCycleDateChange(event) {
    this.setData({
      "cycleProfile.lastPeriodDate": event.detail.value
    });
  },

  onCycleLengthInput(event) {
    const value = (event.detail.value || "").replace(/[^\d]/g, "").slice(0, 2);
    this.setData({
      "cycleProfile.cycleLength": value
    });
  },

  onPeriodLengthInput(event) {
    const value = (event.detail.value || "").replace(/[^\d]/g, "").slice(0, 2);
    this.setData({
      "cycleProfile.periodLength": value
    });
  },

  onSaveCycleSetup() {
    const { lastPeriodDate, cycleLength, periodLength } = this.data.cycleProfile;
    const cycleNum = Number(cycleLength);
    const periodNum = Number(periodLength);
    const todayDate = cycleEngine.getTodayDate();
    const todayDateKey = this.data.todayDateKey;

    if (!lastPeriodDate) {
      wx.showToast({
        title: "请选择上次经期日期",
        icon: "none"
      });
      return;
    }

    if (cycleEngine.diffDays(cycleEngine.parseDateKey(lastPeriodDate), todayDate) < 0) {
      wx.showToast({
        title: "开始日期不能晚于今天",
        icon: "none"
      });
      return;
    }

    if (!cycleNum || cycleNum < 21 || cycleNum > 35) {
      wx.showToast({
        title: "周期天数填写 21-35",
        icon: "none"
      });
      return;
    }

    if (!periodNum || periodNum < 3 || periodNum > 8) {
      wx.showToast({
        title: "经期天数填写 3-8",
        icon: "none"
      });
      return;
    }

    const previousProfile = this.data.cycleProfile;
    const profile = cycleEngine.normalizeProfile({
      lastPeriodDate,
      cycleLength: String(cycleNum),
      periodLength: String(periodNum),
      todayPeriodStartEnabled: previousProfile.todayPeriodStartEnabled,
      adjustments:
        previousProfile.lastPeriodDate === lastPeriodDate &&
        previousProfile.cycleLength === String(cycleNum) &&
        previousProfile.periodLength === String(periodNum)
          ? previousProfile.adjustments || {}
          : {}
    });

    wx.setStorageSync(this.cycleStorageKey, profile);
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
    if (!this.data.selectedDetail || !this.data.selectedDetail.dateKey) return;

    const selectedDate = cycleEngine.parseDateKey(this.data.selectedDetail.dateKey);
    const built = cycleEngine.buildWeeks(
      this.data.cycleProfile,
      this.data.viewYear,
      this.data.viewMonth,
      this.data.selectedDateKey
    );
    const cycleIndex = cycleEngine.getNearestFutureCycleIndex(
      built.cycleStarts,
      selectedDate,
      cycleEngine.getTodayDate()
    );

    if (cycleIndex === null) {
      wx.showToast({
        title: "当前日期无法调整预测",
        icon: "none"
      });
      return;
    }

    const adjustments = Object.assign({}, this.data.cycleProfile.adjustments, {
      [String(cycleIndex)]: this.data.selectedDetail.dateKey
    });
    const nextProfile = cycleEngine.normalizeProfile({
      lastPeriodDate: this.data.cycleProfile.lastPeriodDate,
      cycleLength: this.data.cycleProfile.cycleLength,
      periodLength: this.data.cycleProfile.periodLength,
      todayPeriodStartEnabled: this.data.cycleProfile.todayPeriodStartEnabled,
      adjustments: adjustments
    });

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
