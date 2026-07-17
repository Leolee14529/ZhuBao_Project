const INSPIRATIONS = [
  { no: "NO.01", symbol: "润" },
  { no: "NO.02", symbol: "明" },
  { no: "NO.03", symbol: "稳" },
  { no: "NO.04", symbol: "柔" },
  { no: "NO.05", symbol: "展" }
];

function dayNumber(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return 0;
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
}

function getForDateKey(dateKey) {
  const inspiration = INSPIRATIONS[dayNumber(dateKey) % INSPIRATIONS.length];
  return { ...inspiration };
}

module.exports = { getForDateKey };
