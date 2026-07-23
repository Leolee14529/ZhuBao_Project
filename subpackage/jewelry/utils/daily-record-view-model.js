function formatSleep(minutes, copy) {
  if (!Number.isInteger(minutes) || minutes < 0) return copy.noSleep;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return rest + copy.minutesUnit;
  if (!rest) return hours + copy.hoursUnit;
  return hours + copy.hoursUnit + rest + copy.minutesUnit;
}

function formatSleepDuration(minutes) {
  const totalMinutes = Number(minutes) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const restMinutes = totalMinutes % 60;
  if (hours > 0 && restMinutes > 0) return hours + "小时" + restMinutes + "分";
  if (hours > 0) return hours + "小时";
  return restMinutes + "分钟";
}

function buildDailyRecordView(checkin, copy) {
  if (!checkin) {
    return {
      hasRecord: false,
      entryCount: 0,
      mood: "--",
      energy: "--",
      sleep: copy.noSleep,
      wearing: "--",
      tags: [],
      note: copy.noNote
    };
  }

  const tagLabels = (copy.tagOptions || []).reduce((labels, item) => {
    labels[item.value] = item.label;
    return labels;
  }, {});

  return {
    hasRecord: true,
    entryCount: 1,
    mood: checkin.mood + "/5",
    energy: checkin.energy + "/5",
    sleep: formatSleep(checkin.sleepMinutes, copy),
    wearing: checkin.isWearingJewelry ? copy.wearingYes : copy.wearingNo,
    tags: Array.isArray(checkin.tags) ? checkin.tags.map((tag) => tagLabels[tag] || tag) : [],
    note: checkin.note || copy.noNote
  };
}

function buildDailyRecordPageState(checkin, options, copy) {
  const state = options || {};
  const record = buildDailyRecordView(checkin, copy);
  const status = state.loading
    ? "loading"
    : state.loadError
      ? "error"
      : record.hasRecord ? "record" : "empty";

  return {
    status,
    canEdit: status === "empty" || status === "record",
    showEmpty: status === "empty",
    record
  };
}

function buildUndoView(status) {
  const current = status || "idle";
  return {
    visible: current === "available" || current === "restoring" || current === "failed",
    canRetry: current === "available" || current === "failed",
    restoring: current === "restoring"
  };
}

function parseDateKey(dateKey) {
  const parts = String(dateKey || "").split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 12);
}

function toDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function buildWeekDays(dateKey, copy) {
  const end = parseDateKey(dateKey);
  const dayLabels = Array.isArray(copy.weekDays) && copy.weekDays.length === 7
    ? copy.weekDays
    : ["日", "一", "二", "三", "四", "五", "六"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (6 - index));
    const key = toDateKey(date);
    return {
      dateKey: key,
      dayLabel: dayLabels[date.getDay()],
      dateLabel: (date.getMonth() + 1) + "/" + date.getDate(),
      isToday: key === dateKey,
      value: null,
      barHeight: 16
    };
  });
}

function buildWeeklyRecordView(checkins, dateKey, copy, options) {
  const records = Array.isArray(checkins) ? checkins : [];
  const isInitialized = Boolean(options && options.initialized);
  const days = buildWeekDays(dateKey, copy);
  const byDate = records.reduce((result, item) => {
    if (item && item.checkinDate) result[item.checkinDate] = item;
    return result;
  }, {});
  const visibleRecords = days.map((day) => byDate[day.dateKey]).filter(Boolean);
  const tagCounts = {};
  const tagOrder = [];
  const tagLabels = (copy.tagOptions || []).reduce((labels, item) => {
    labels[item.value] = item.label;
    return labels;
  }, {});

  visibleRecords.forEach((record) => {
    (Array.isArray(record.tags) ? record.tags : []).forEach((tag) => {
      if (!tagCounts[tag]) tagOrder.push(tag);
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  days.forEach((day) => {
    const record = byDate[day.dateKey];
    if (!record || !Number.isInteger(record.mood)) return;
    day.value = record.mood;
    day.barHeight = 20 + record.mood * 18;
  });

  if (!visibleRecords.length) {
    return {
      hasRecords: false,
      days,
      recordedDays: isInitialized ? 0 + copy.weekRecordedUnit : "--",
      averageMood: "--",
      jewelryDays: isInitialized ? 0 + copy.jewelryDaysUnit : "--",
      topFeelings: [],
      summary: copy.noWeeklyRecords,
      from: days[0].dateKey,
      to: days[6].dateKey
    };
  }

  const moodTotal = visibleRecords.reduce((sum, item) => sum + item.mood, 0);
  const topFeelings = tagOrder.map((label, order) => ({ label, count: tagCounts[label], order }))
    .sort((left, right) => right.count - left.count || left.order - right.order)
    .slice(0, 3)
    .map((item) => ({ label: tagLabels[item.label] || item.label, count: item.count, countText: item.count + copy.timesUnit }));

  return {
    hasRecords: true,
    days,
    recordedDays: visibleRecords.length + copy.weekRecordedUnit,
    averageMood: (moodTotal / visibleRecords.length).toFixed(1) + copy.averageMoodUnit,
    jewelryDays: visibleRecords.filter((item) => item.isWearingJewelry).length + copy.jewelryDaysUnit,
    topFeelings,
    summary: copy.weekSummary,
    from: days[0].dateKey,
    to: days[6].dateKey
  };
}

function buildTodayFeeling(checkin, copy) {
  if (!checkin) return { hasRecord: false, title: copy.noTodayFeeling, detail: "" };
  let title = copy.calmPace;
  if (checkin.mood <= 2 || checkin.energy <= 2) title = copy.gentlePace;
  if (checkin.mood >= 4 && checkin.energy >= 4) title = copy.brightPace;
  return {
    hasRecord: true,
    title,
    detail: checkin.isWearingJewelry ? copy.jewelryCompanion : copy.selfCompanion
  };
}

function addDays(dateKey, amount) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

function buildSleepRange(dateKey, mode) {
  const currentMode = mode === "month" || mode === "week" ? mode : "day";
  const days = currentMode === "month" ? 30 : currentMode === "week" ? 7 : 1;
  return {
    from: addDays(dateKey, -(days - 1)),
    to: dateKey,
    limit: days,
    days
  };
}

function buildSleepTrend(checkins, dateKey, mode, copy) {
  const range = buildSleepRange(dateKey, mode);
  const records = Array.isArray(checkins) ? checkins : [];
  const byDate = records.reduce((result, item) => {
    if (item && item.checkinDate >= range.from && item.checkinDate <= range.to && Number.isInteger(item.sleepMinutes) && item.sleepMinutes >= 0) {
      result[item.checkinDate] = item.sleepMinutes;
    }
    return result;
  }, {});
  const weekDays = Array.isArray(copy.weekDays) && copy.weekDays.length === 7
    ? copy.weekDays
    : ["日", "一", "二", "三", "四", "五", "六"];
  const recordedValues = Object.values(byDate);
  const maxMinutes = Math.max(1, ...recordedValues);
  const points = Array.from({ length: range.days }, (_, index) => {
    const pointDateKey = addDays(range.from, index);
    const pointDate = parseDateKey(pointDateKey);
    const minutes = Object.prototype.hasOwnProperty.call(byDate, pointDateKey) ? byDate[pointDateKey] : null;
    return {
      dateKey: pointDateKey,
      label: range.days === 7 ? weekDays[pointDate.getDay()] : String(pointDate.getDate()),
      durationText: minutes === null ? "" : formatSleepDuration(minutes),
      minutes,
      duration: minutes === null ? "" : formatSleep(minutes, copy),
      barHeight: minutes === null ? 16 : Math.max(28, Math.round(minutes / maxMinutes * 112)),
      isEnd: pointDateKey === dateKey
    };
  });
  const totalMinutes = recordedValues.reduce((sum, minutes) => sum + minutes, 0);

  return {
    ...range,
    hasRecords: recordedValues.length > 0,
    points,
    recordedNights: recordedValues.length ? recordedValues.length + copy.recordedNightsUnit : "--",
    averageSleep: recordedValues.length ? formatSleep(Math.round(totalMinutes / recordedValues.length), copy) : (copy.averageSleepEmpty || "--"),
    summary: recordedValues.length ? "" : copy.noSleepTrend
  };
}

module.exports = {
  buildDailyRecordPageState,
  buildDailyRecordView,
  buildTodayFeeling,
  buildUndoView,
  buildWeeklyRecordView,
  buildSleepRange,
  buildSleepTrend,
  formatSleep
};
