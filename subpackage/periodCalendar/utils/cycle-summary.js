var dates = require("./date-utils");

function flattenWeeks(weeks) {
  var days = [];
  weeks.forEach(function (week) {
    week.forEach(function (item) {
      days.push(item);
    });
  });
  return days;
}

function buildSelectedDetail(weeks, selectedDateKey, todayDate) {
  if (!selectedDateKey) return null;
  var matched = null;

  flattenWeeks(weeks).forEach(function (item) {
    if (item.dateKey === selectedDateKey) matched = item;
  });
  if (!matched) return null;

  var selectedDate = dates.parseDateKey(matched.dateKey);
  return {
    dateKey: matched.dateKey,
    fullDate: dates.formatFullDate(selectedDate),
    status: matched.status,
    statusLabel: matched.statusLabel,
    remark: matched.remark,
    canAdjust: dates.diffDays(todayDate, selectedDate) > 0 && matched.status !== "period",
    cycleIndex: matched.cycleIndex,
    cycleStartDateKey: matched.cycleStartDateKey
  };
}

function buildSummary(cycleStarts, todayDate) {
  var nextStart = null;
  cycleStarts.forEach(function (cycle) {
    if (cycle.cycleIndex > 0 && !nextStart &&
      dates.diffDays(todayDate, cycle.startDate) >= 0) {
      nextStart = cycle.startDate;
    }
  });

  if (!nextStart) {
    return { daysUntil: "--", nextStartLabel: "暂无参考日期" };
  }
  return {
    daysUntil: String(dates.diffDays(todayDate, nextStart)),
    nextStartLabel: "预计" + dates.formatDateKey(nextStart) + "开始"
  };
}

function getNearestFutureCycleIndex(cycleStarts, targetDate, todayDate) {
  var matchedIndex = null;
  var smallestGap = Infinity;

  cycleStarts.forEach(function (cycle) {
    if (cycle.cycleIndex <= 0) return;
    if (dates.diffDays(todayDate, cycle.startDate) < 0) return;

    var currentGap = Math.abs(dates.diffDays(targetDate, cycle.startDate));
    if (currentGap < smallestGap) {
      smallestGap = currentGap;
      matchedIndex = cycle.cycleIndex;
    }
  });
  return matchedIndex;
}

module.exports = {
  buildSelectedDetail: buildSelectedDetail,
  buildSummary: buildSummary,
  getNearestFutureCycleIndex: getNearestFutureCycleIndex
};
