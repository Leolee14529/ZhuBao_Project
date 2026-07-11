const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getBeijingMoodCycle,
  selectWeightedMood
} = require("../services/moodService");
const { MOOD_TEMPLATE_COUNT } = require("../services/moodTemplateData");
const { buildMoodTemplates } = require("../services/moodTemplateData");

test("Beijing mood cycle changes at noon instead of midnight", () => {
  const beforeNoon = getBeijingMoodCycle(new Date("2026-07-09T03:59:00.000Z"));
  const atNoon = getBeijingMoodCycle(new Date("2026-07-09T04:00:00.000Z"));

  assert.equal(beforeNoon.date, "2026-07-08");
  assert.equal(beforeNoon.updatedAt, "2026-07-08 12:00:00");
  assert.equal(atNoon.date, "2026-07-09");
  assert.equal(atNoon.updatedAt, "2026-07-09 12:00:00");
});

test("mood template seed builds one hundred enabled templates", () => {
  const templates = buildMoodTemplates();
  assert.equal(templates.length, 100);
  assert.equal(MOOD_TEMPLATE_COUNT, 100);
  assert.equal(templates.every((item) => item.status === "enabled"), true);
});

test("weighted mood selection avoids yesterday when alternatives exist", () => {
  const selected = selectWeightedMood([
    { id: "same-as-yesterday", status: "enabled", weight: 100 },
    { id: "new-today", status: "enabled", weight: 1 }
  ], "same-as-yesterday");

  assert.equal(selected.id, "new-today");
});
