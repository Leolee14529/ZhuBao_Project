var cycleEngine = require("./cycle-engine");

function prepareSavedProfile(source, todayDate) {
  var lastPeriodDate = source.lastPeriodDate;
  var cycleNum = Number(source.cycleLength);
  var periodNum = Number(source.periodLength);

  if (!lastPeriodDate) {
    return { error: "Select the last period date" };
  }
  if (cycleEngine.diffDays(cycleEngine.parseDateKey(lastPeriodDate), todayDate) < 0) {
    return { error: "Start date cannot be later than today" };
  }
  if (!cycleNum || cycleNum < 21 || cycleNum > 35) {
    return { error: "Cycle length must be 21-35 days" };
  }
  if (!periodNum || periodNum < 3 || periodNum > 8) {
    return { error: "Duration must be 3-8 days" };
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
