function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function createLocalDate(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function getTodayDate() {
  var today = new Date();
  return createLocalDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function parseDateKey(dateKey) {
  if (!dateKey) return null;
  var parts = dateKey.split("-").map(function (item) { return Number(item); });
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  return createLocalDate(parts[0], parts[1], parts[2]);
}

function toDateKey(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function formatDateKey(date) {
  return toDateKey(date);
}

function formatReadableDate(date) {
  return MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function addDays(date, days) {
  var next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return createLocalDate(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

function diffDays(startDate, endDate) {
  var start = createLocalDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).getTime();
  var end = createLocalDate(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()).getTime();
  return Math.round((end - start) / 86400000);
}

function sameDate(left, right) {
  return !!left && !!right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
}

function formatMonthTitle(year, month) {
  return MONTHS[month - 1] + " " + year;
}

function formatFullDate(date) {
  return formatReadableDate(date);
}

module.exports = {
  pad: pad,
  MONTHS: MONTHS,
  createLocalDate: createLocalDate,
  getTodayDate: getTodayDate,
  parseDateKey: parseDateKey,
  toDateKey: toDateKey,
  formatDateKey: formatDateKey,
  formatReadableDate: formatReadableDate,
  addDays: addDays,
  diffDays: diffDays,
  sameDate: sameDate,
  formatFullDate: formatFullDate,
  formatMonthTitle: formatMonthTitle,
  formatMonthLabel: formatMonthTitle
};
