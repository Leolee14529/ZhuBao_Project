function formatSleep(minutes, copy) {
  if (!Number.isInteger(minutes) || minutes < 0) return copy.noSleep;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return rest + copy.minutesUnit;
  if (!rest) return hours + copy.hoursUnit;
  return hours + copy.hoursUnit + rest + copy.minutesUnit;
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

module.exports = { buildDailyRecordPageState, buildDailyRecordView, buildUndoView, formatSleep };
