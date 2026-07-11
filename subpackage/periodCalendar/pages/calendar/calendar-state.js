const cycleEngine = require("../../utils/cycle-engine");

function getSafeArea() {
  const fallback = {
    statusBarHeight: 47,
    topbarHeight: 91,
    contentTopOffset: 99,
    backButtonTop: 55
  };
  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect ?
      wx.getMenuButtonBoundingClientRect() : null;
    const windowWidth = info.windowWidth || 375;
    const backButtonHeight = 56 * windowWidth / 750;
    const statusBarHeight = info.statusBarHeight || fallback.statusBarHeight;
    let topbarHeight = statusBarHeight + 44;
    let backButtonTop = statusBarHeight + 8;
    if (menuButton && menuButton.top) {
      topbarHeight = Math.max(menuButton.bottom + 8, statusBarHeight + 44);
      backButtonTop = menuButton.top + (menuButton.height - backButtonHeight) / 2 + 2;
    }
    return {
      statusBarHeight,
      topbarHeight: Math.round(topbarHeight),
      contentTopOffset: Math.round(topbarHeight + 8),
      backButtonTop: Math.round(backButtonTop)
    };
  } catch (error) {
    return fallback;
  }
}

function getDefaultProfile(todayDateKey) {
  return {
    lastPeriodDate: todayDateKey,
    cycleLength: "28",
    periodLength: "5",
    todayPeriodStartEnabled: false,
    adjustments: {}
  };
}

function create(profile) {
  const todayDate = cycleEngine.getTodayDate();
  const todayDateKey = cycleEngine.formatDateKey(todayDate);
  const hasCycleData = Boolean(profile);
  const cycleProfile = cycleEngine.normalizeProfile(
    profile || getDefaultProfile(todayDateKey)
  );
  const viewYear = todayDate.getFullYear();
  const viewMonth = todayDate.getMonth() + 1;
  const built = cycleEngine.buildWeeks(
    cycleProfile,
    viewYear,
    viewMonth,
    todayDateKey
  );
  const summary = hasCycleData ?
    cycleEngine.buildSummary(built.cycleStarts, todayDate) : null;

  return Object.assign(getSafeArea(), {
    monthLabel: cycleEngine.formatMonthLabel(viewYear, viewMonth),
    viewYear,
    viewMonth,
    hasCycleData,
    todayDateKey,
    selectedDateKey: todayDateKey,
    selectedDetail: hasCycleData ?
      cycleEngine.buildSelectedDetail(built.weeks, todayDateKey, todayDate) : null,
    summaryDays: summary ? summary.daysUntil : "--",
    summaryNextStart: summary ? summary.nextStartLabel : "设置后生成周期参考",
    cycleProfile,
    weeks: built.weeks
  });
}

module.exports = {
  create
};
