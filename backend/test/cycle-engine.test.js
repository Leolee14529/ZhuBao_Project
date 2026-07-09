const assert = require("node:assert/strict");
const test = require("node:test");
const cycleEngine = require("../../subpackage/periodCalendar/utils/cycle-engine");
const cycleProfile = require("../../subpackage/periodCalendar/utils/cycle-profile");

test("cycle profile normalization keeps values in supported ranges", () => {
  const normalized = cycleEngine.normalizeProfile({
    lastPeriodDate: "2026-06-01",
    cycleLength: "99",
    periodLength: "1"
  });

  assert.equal(normalized.cycleLength, "35");
  assert.equal(normalized.periodLength, "3");
});

test("calendar engine always builds six weeks", () => {
  const profile = cycleEngine.normalizeProfile({
    lastPeriodDate: "2026-06-01",
    cycleLength: "28",
    periodLength: "5"
  });
  const built = cycleEngine.buildWeeks(profile, 2026, 6, "2026-06-01");

  assert.equal(built.weeks.length, 6);
  assert.equal(built.weeks.flat().length, 42);
  assert.ok(built.cycleStarts.length > 1);
});

test("past inferred cycles are labeled as references, not actual periods", () => {
  const profile = cycleEngine.normalizeProfile({
    lastPeriodDate: "2026-06-15",
    cycleLength: "28",
    periodLength: "5"
  });
  const built = cycleEngine.buildWeeks(profile, 2026, 5, "2026-05-18");
  const pastCell = built.weeks.flat().find((cell) => cell.dateKey === "2026-05-18");

  assert.equal(pastCell.status, "periodForecast");
  assert.equal(pastCell.statusLabel, "参考周期");
});

test("cycle setup validation rejects future dates", () => {
  const result = cycleProfile.prepareSavedProfile({
    lastPeriodDate: "2026-07-01",
    cycleLength: "28",
    periodLength: "5",
    adjustments: {}
  }, cycleEngine.createLocalDate(2026, 6, 27));

  assert.equal(result.error, "开始日期不能晚于今天");
});
