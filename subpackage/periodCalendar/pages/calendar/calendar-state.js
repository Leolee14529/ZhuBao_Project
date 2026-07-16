const cycleEngine = require("../../utils/cycle-engine");
const topLayout = require("../../../../utils/top-layout");

function getSafeArea() {
  try {
    const layout = topLayout.getTopLayout();
    return {
      statusBarHeight: layout.statusBarHeight,
      topbarHeight: layout.topbarHeight,
      contentTopOffset: layout.contentOffset,
      backButtonTop: layout.backButtonTop
    };
  } catch (error) {
    return {
      statusBarHeight: 20,
      topbarHeight: 64,
      contentTopOffset: 64,
      backButtonTop: 28
    };
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
    summaryNextStart: summary ? summary.nextStartLabel : "Set up to generate period references",
    cycleProfile,
    weeks: built.weeks
  });
}

module.exports = {
  create
};
