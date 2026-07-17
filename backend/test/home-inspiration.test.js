const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");
const modulePath = path.join(root, "utils/home-inspiration.js");

test("today inspiration is keyed by the local calendar date instead of UTC milliseconds", () => {
  assert.equal(fs.existsSync(modulePath), true);
  const homeInspiration = require(modulePath);
  const first = homeInspiration.getForDateKey("2026-07-17");
  const sameLocalDay = homeInspiration.getForDateKey("2026-07-17");
  const nextLocalDay = homeInspiration.getForDateKey("2026-07-18");

  assert.deepEqual(first, sameLocalDay);
  assert.notDeepEqual(first, nextLocalDay);

  const homeLogic = fs.readFileSync(path.join(root, "pages/home/index.js"), "utf8");
  assert.ok(homeLogic.includes("homeInspiration.getForDateKey(dailyCheckins.toDateKey())"));
  assert.ok(!homeLogic.includes("Date.now() / 86400000"));
});
