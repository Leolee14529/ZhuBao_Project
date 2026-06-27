const assert = require("node:assert/strict");
const test = require("node:test");
const { calculateWuxing } = require("../services/baziService");

test("known birth input keeps the established calculation output", () => {
  const result = calculateWuxing({
    userId: "golden-user",
    birthDate: "2003-12-09",
    birthTime: "10:30",
    gender: "female"
  });

  assert.deepEqual(result.bazi, {
    year: "癸未",
    month: "壬子",
    day: "乙卯",
    hour: "辛巳"
  });
  assert.deepEqual(result.elements, {
    wood: 25,
    fire: 13,
    earth: 13,
    metal: 12,
    water: 37
  });
  assert.equal(result.dominant, "水");
  assert.equal(result.raw.solarTerm.name_cn, "大雪");
  assert.equal(result.raw.timezone, "UTC+8");
});

test("invalid calendar input is rejected", () => {
  assert.throws(
    () => calculateWuxing({
      birthDate: "2026-02-30",
      birthTime: "10:30",
      gender: "female"
    }),
    /not a valid calendar date/
  );
});
