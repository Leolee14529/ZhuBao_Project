const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const form = require("../../subpackage/jewelry/utils/daily-record-form");

test("daily record form converts user fields into the server contract", () => {
  const input = form.buildCheckinInput({
    mood: 4,
    energy: 3,
    sleepHours: "7",
    sleepMinutes: "30",
    isWearingJewelry: true,
    tags: ["平静", "专注"],
    note: "  今天状态稳定  "
  }, "2026-07-17");

  assert.deepEqual(input, {
    checkinDate: "2026-07-17",
    mood: 4,
    energy: 3,
    sleepMinutes: 450,
    isWearingJewelry: true,
    tags: ["平静", "专注"],
    note: "今天状态稳定"
  });
});

test("daily record form rejects invalid sleep duration", () => {
  assert.throws(() => form.buildCheckinInput({
    mood: 3,
    energy: 3,
    sleepHours: "24",
    sleepMinutes: "1",
    isWearingJewelry: false,
    tags: [],
    note: ""
  }, "2026-07-17"), /SLEEP_INVALID/);
});

test("data page exposes create, update, delete, and undo through one editor component", () => {
  const root = path.resolve(__dirname, "../..");
  const logic = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.wxml"), "utf8");
  const config = JSON.parse(fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.json"), "utf8"));

  assert.equal(config.usingComponents["daily-record-editor"], "/subpackage/jewelry/components/daily-record-editor/daily-record-editor");
  assert.ok(view.includes("<daily-record-editor"));
  assert.ok(logic.includes("dailyCheckins.save"));
  assert.ok(logic.includes("dailyCheckins.remove"));
  assert.ok(logic.includes("undoDelete"));
});

test("daily record editor uses component-safe class selectors", () => {
  const root = path.resolve(__dirname, "../..");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/components/daily-record-editor/daily-record-editor.wxml"), "utf8");
  const style = fs.readFileSync(path.join(root, "subpackage/jewelry/components/daily-record-editor/daily-record-editor.wxss"), "utf8");

  assert.ok(view.includes('class="editor-textarea"'));
  assert.ok(!/(^|})textarea\{/.test(style));
  assert.ok(!style.includes(".sleep-inputs input"));
  assert.ok(!style.includes(".sleep-inputs text"));
});
