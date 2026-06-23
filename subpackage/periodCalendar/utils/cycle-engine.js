var DAY_MS = 24 * 60 * 60 * 1000;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function parseDateKey(dateKey) {
  if (!dateKey) return null;
  var parts = dateKey.split("-").map(function (item) {
    return Number(item);
  });
  return createLocalDate(parts[0], parts[1], parts[2]);
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("-");
}

function formatMonthLabel(year, month) {
  return year + "年" + month + "月";
}

function formatFullDate(date) {
  return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function diffDays(startDate, endDate) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / DAY_MS);
}

function sameDate(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getTodayDate() {
  var now = new Date();
  return createLocalDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function normalizeProfile(profile) {
  var todayKey = formatDateKey(getTodayDate());
  var source = profile || {};
  var cycleLength = Number(source.cycleLength) || 28;
  var periodLength = Number(source.periodLength) || 5;

  if (cycleLength < 21) cycleLength = 21;
  if (cycleLength > 35) cycleLength = 35;
  if (periodLength < 3) periodLength = 3;
  if (periodLength > 8) periodLength = 8;

  return {
    lastPeriodDate: source.lastPeriodDate || todayKey,
    cycleLength: String(cycleLength),
    periodLength: String(periodLength),
    todayPeriodStartEnabled: !!source.todayPeriodStartEnabled,
    adjustments: source.adjustments || {}
  };
}

function getEffectiveBaseDate(profile, todayDate) {
  if (profile.todayPeriodStartEnabled) {
    return todayDate;
  }
  return parseDateKey(profile.lastPeriodDate) || todayDate;
}

function buildCycleStarts(profile, rangeStart, rangeEnd, todayDate) {
  var cycleLength = Number(profile.cycleLength) || 28;
  var baseDate = getEffectiveBaseDate(profile, todayDate);
  var adjustments = profile.adjustments || {};
  var starts = [];
  var backwardCount = Math.ceil(Math.max(0, diffDays(rangeStart, baseDate)) / cycleLength) + 3;
  var forwardCount = Math.ceil(Math.max(0, diffDays(baseDate, rangeEnd)) / cycleLength) + 6;
  var index;
  var previousStart;

  for (index = backwardCount; index >= 1; index -= 1) {
    starts.push({
      cycleIndex: -index,
      startDate: addDays(baseDate, -index * cycleLength),
      isPredictedStart: false,
      source: "history"
    });
  }

  starts.push({
    cycleIndex: 0,
    startDate: baseDate,
    isPredictedStart: false,
    source: profile.todayPeriodStartEnabled ? "today" : "saved"
  });

  previousStart = baseDate;
  for (index = 1; index <= forwardCount; index += 1) {
    var predictedStart = addDays(previousStart, cycleLength);
    var adjustedDate = parseDateKey(adjustments[String(index)]);
    var finalStart = predictedStart;

    if (adjustedDate && diffDays(previousStart, adjustedDate) > 0) {
      finalStart = adjustedDate;
    }

    starts.push({
      cycleIndex: index,
      startDate: finalStart,
      isPredictedStart: true,
      source: adjustedDate ? "adjusted" : "predicted"
    });
    previousStart = finalStart;
  }

  return starts;
}

function classifyDate(date, cycleStarts, periodLength) {
  var index;
  var cycle;
  var daysFromStart;
  var daysBeforeStart;

  for (index = 0; index < cycleStarts.length; index += 1) {
    cycle = cycleStarts[index];
    daysFromStart = diffDays(cycle.startDate, date);
    if (daysFromStart >= 0 && daysFromStart < periodLength) {
      return {
        status: cycle.cycleIndex <= 0 ? "period" : "periodForecast",
        statusLabel: cycle.cycleIndex <= 0 ? "经期" : "预测经期",
        cycleIndex: cycle.cycleIndex,
        cycleStartDateKey: formatDateKey(cycle.startDate)
      };
    }
  }

  for (index = 0; index < cycleStarts.length; index += 1) {
    cycle = cycleStarts[index];
    daysBeforeStart = diffDays(date, cycle.startDate);

    if (daysBeforeStart === 14) {
      return {
        status: "ovulation",
        statusLabel: "排卵日",
        cycleIndex: cycle.cycleIndex,
        cycleStartDateKey: formatDateKey(cycle.startDate)
      };
    }

    if (daysBeforeStart >= 13 && daysBeforeStart <= 19) {
      return {
        status: "fertile",
        statusLabel: "易孕期",
        cycleIndex: cycle.cycleIndex,
        cycleStartDateKey: formatDateKey(cycle.startDate)
      };
    }
  }

  return {
    status: "safe",
    statusLabel: "安全期",
    cycleIndex: null,
    cycleStartDateKey: ""
  };
}

function buildWeeks(profile, year, month, selectedDateKey) {
  var todayDate = getTodayDate();
  var firstDay = createLocalDate(year, month, 1);
  var firstWeekday = firstDay.getDay();
  var daysInMonth = new Date(year, month, 0, 12, 0, 0, 0).getDate();
  var prevMonthDays = new Date(year, month - 1, 0, 12, 0, 0, 0).getDate();
  var rangeStart = addDays(firstDay, -firstWeekday - 20);
  var rangeEnd = addDays(createLocalDate(year, month, daysInMonth), 40);
  var cycleStarts = buildCycleStarts(profile, rangeStart, rangeEnd, todayDate);
  var periodLength = Number(profile.periodLength) || 5;
  var cells = [];
  var totalCells = 42;
  var index;

  for (index = 0; index < totalCells; index += 1) {
    var dayOffset = index - firstWeekday + 1;
    var cellYear = year;
    var cellMonth = month;
    var day = dayOffset;
    var muted = false;

    if (dayOffset <= 0) {
      muted = true;
      day = prevMonthDays + dayOffset;
      cellMonth = month - 1;
      if (cellMonth < 1) {
        cellMonth = 12;
        cellYear -= 1;
      }
    } else if (dayOffset > daysInMonth) {
      muted = true;
      day = dayOffset - daysInMonth;
      cellMonth = month + 1;
      if (cellMonth > 12) {
        cellMonth = 1;
        cellYear += 1;
      }
    }

    var cellDate = createLocalDate(cellYear, cellMonth, day);
    var dateKey = formatDateKey(cellDate);
    var detail = classifyDate(cellDate, cycleStarts, periodLength);

    cells.push({
      year: cellYear,
      month: cellMonth,
      day: String(day),
      dateKey: dateKey,
      muted: muted,
      isToday: sameDate(cellDate, todayDate),
      isSelected: selectedDateKey === dateKey,
      status: detail.status,
      statusLabel: detail.statusLabel,
      remark: "暂无",
      cycleIndex: detail.cycleIndex,
      cycleStartDateKey: detail.cycleStartDateKey
    });
  }

  var weeks = [];
  for (index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return {
    weeks: weeks,
    cycleStarts: cycleStarts
  };
}

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
    if (item.dateKey === selectedDateKey) {
      matched = item;
    }
  });

  if (!matched) return null;

  var selectedDate = parseDateKey(matched.dateKey);
  var canAdjust = diffDays(todayDate, selectedDate) > 0 && matched.status !== "period";

  return {
    dateKey: matched.dateKey,
    fullDate: formatFullDate(selectedDate),
    status: matched.status,
    statusLabel: matched.statusLabel,
    remark: matched.remark,
    canAdjust: canAdjust,
    cycleIndex: matched.cycleIndex,
    cycleStartDateKey: matched.cycleStartDateKey
  };
}

function buildSummary(cycleStarts, todayDate) {
  var nextStart = null;

  cycleStarts.forEach(function (cycle) {
    if (cycle.cycleIndex > 0 && !nextStart && diffDays(todayDate, cycle.startDate) >= 0) {
      nextStart = cycle.startDate;
    }
  });

  if (!nextStart) {
    return {
      daysUntil: "--",
      nextStartLabel: "暂无预测结果"
    };
  }

  return {
    daysUntil: String(diffDays(todayDate, nextStart)),
    nextStartLabel: "预计" + formatDateKey(nextStart) + "开始"
  };
}

function getNearestFutureCycleIndex(cycleStarts, targetDate, todayDate) {
  var matchedIndex = null;
  var smallestGap = Infinity;

  cycleStarts.forEach(function (cycle) {
    if (cycle.cycleIndex <= 0) return;
    if (diffDays(todayDate, cycle.startDate) < 0) return;

    var currentGap = Math.abs(diffDays(targetDate, cycle.startDate));
    if (currentGap < smallestGap) {
      smallestGap = currentGap;
      matchedIndex = cycle.cycleIndex;
    }
  });

  return matchedIndex;
}

module.exports = {
  addDays: addDays,
  buildSelectedDetail: buildSelectedDetail,
  buildSummary: buildSummary,
  buildWeeks: buildWeeks,
  createLocalDate: createLocalDate,
  diffDays: diffDays,
  formatDateKey: formatDateKey,
  formatMonthLabel: formatMonthLabel,
  getNearestFutureCycleIndex: getNearestFutureCycleIndex,
  getTodayDate: getTodayDate,
  normalizeProfile: normalizeProfile,
  parseDateKey: parseDateKey
};
