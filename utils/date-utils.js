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

module.exports = {
  addDays: addDays,
  createLocalDate: createLocalDate,
  diffDays: diffDays,
  formatDateKey: formatDateKey,
  formatFullDate: formatFullDate,
  formatMonthLabel: formatMonthLabel,
  getTodayDate: getTodayDate,
  parseDateKey: parseDateKey,
  sameDate: sameDate
};
