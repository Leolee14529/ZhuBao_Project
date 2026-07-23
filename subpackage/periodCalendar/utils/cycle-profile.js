var cycleEngine = require("../../../utils/cycle-engine");

function prepareSavedProfile(source, todayDate) {
  var lastPeriodDate = source.lastPeriodDate;
  var cycleNum = Number(source.cycleLength);
  var periodNum = Number(source.periodLength);

  if (!lastPeriodDate) {
    return { error: "请选择上次经期日期" };
  }
  if (cycleEngine.diffDays(cycleEngine.parseDateKey(lastPeriodDate), todayDate) < 0) {
    return { error: "开始日期不能晚于今天" };
  }
  if (!cycleNum || cycleNum < 21 || cycleNum > 35) {
    return { error: "周期天数填写 21-35" };
  }
  if (!periodNum || periodNum < 3 || periodNum > 8) {
    return { error: "经期天数填写 3-8" };
  }

  var valuesUnchanged =
    source.lastPeriodDate === lastPeriodDate &&
    source.cycleLength === String(cycleNum) &&
    source.periodLength === String(periodNum);
  return {
    profile: cycleEngine.normalizeProfile({
      lastPeriodDate: lastPeriodDate,
      cycleLength: String(cycleNum),
      periodLength: String(periodNum),
      todayPeriodStartEnabled: source.todayPeriodStartEnabled,
      adjustments: valuesUnchanged ? source.adjustments || {} : {}
    })
  };
}

function adjustPrediction(profile, selectedDetail, year, month) {
  if (!selectedDetail || !selectedDetail.dateKey) return null;

  var selectedDate = cycleEngine.parseDateKey(selectedDetail.dateKey);
  var built = cycleEngine.buildWeeks(profile, year, month, selectedDetail.dateKey);
  var cycleIndex = cycleEngine.getNearestFutureCycleIndex(
    built.cycleStarts,
    selectedDate,
    cycleEngine.getTodayDate()
  );
  if (cycleIndex === null) return null;

  var adjustments = Object.assign({}, profile.adjustments, {
    [String(cycleIndex)]: selectedDetail.dateKey
  });
  return cycleEngine.normalizeProfile({
    lastPeriodDate: profile.lastPeriodDate,
    cycleLength: profile.cycleLength,
    periodLength: profile.periodLength,
    todayPeriodStartEnabled: profile.todayPeriodStartEnabled,
    adjustments: adjustments
  });
}

module.exports = {
  prepareSavedProfile: prepareSavedProfile,
  adjustPrediction: adjustPrediction
};
