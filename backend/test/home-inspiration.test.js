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
  assert.ok(homeLogic.includes("homeInspiration.getForDateKey(dailyCheckins.toDateKey(), locale)"));
  assert.ok(!homeLogic.includes("Date.now() / 86400000"));
});

test("daily inspiration catalog provides thirty stable bilingual entries", () => {
  const homeInspiration = require(modulePath);
  const requiredCopyFields = ["title", "color", "tip", "moodName", "moodDesc", "colorDesc"];
  const selectedIds = new Set();

  for (let day = 1; day <= 30; day += 1) {
    const dateKey = `2026-08-${String(day).padStart(2, "0")}`;
    const zh = homeInspiration.getForDateKey(dateKey, "zh-CN");
    const en = homeInspiration.getForDateKey(dateKey, "en-US");

    selectedIds.add(zh.id);
    assert.equal(zh.id, en.id);
    assert.equal(zh.no, en.no);
    assert.equal(zh.symbol, en.symbol);
    assert.match(zh.swatch, /^#[0-9a-f]{6}$/i);
    requiredCopyFields.forEach((field) => {
      assert.equal(typeof zh[field], "string");
      assert.equal(typeof en[field], "string");
      assert.ok(zh[field].trim().length > 0);
      assert.ok(en[field].trim().length > 0);
    });
  }

  assert.equal(homeInspiration.getCatalogSize(), 30);
  assert.equal(selectedIds.size, 30);
});

test("home inspiration card starts closed and reveals localized content after flipping", () => {
  const view = fs.readFileSync(path.join(root, "pages/home/index.wxml"), "utf8");
  const logic = fs.readFileSync(path.join(root, "pages/home/index.js"), "utf8");
  const front = view.slice(view.indexOf('class="inspiration-front"'), view.indexOf('class="inspiration-back"'));
  const back = view.slice(view.indexOf('class="inspiration-back"'), view.indexOf('class="stats-row"'));

  assert.match(logic, /flipped:\s*false/);
  assert.ok(logic.includes("getForDateKey(dailyCheckins.toDateKey(), locale)"));
  assert.ok(front.includes("copy.flipHint"));
  assert.ok(!front.includes("inspiration.moodName"));
  assert.ok(back.includes("inspiration.tip"));
  assert.ok(view.includes("inspiration.moodName"));
  assert.ok(view.includes("inspiration.moodDesc"));
  assert.ok(view.includes("inspiration.colorDesc"));
});
