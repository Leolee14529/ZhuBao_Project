const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const recordViewModel = require("../../subpackage/jewelry/utils/daily-record-view-model");

const copy = {
  hoursUnit: "小时",
  minutesUnit: "分钟",
  noSleep: "暂无睡眠记录",
  wearingYes: "今日已佩戴",
  wearingNo: "今日未佩戴",
  noNote: "暂无备注"
};

test("daily record view uses real check-in values", () => {
  const view = recordViewModel.buildDailyRecordView({
    checkinDate: "2026-07-17",
    mood: 4,
    energy: 3,
    sleepMinutes: 450,
    isWearingJewelry: true,
    tags: ["平静", "专注"],
    note: "今天状态稳定"
  }, copy);

  assert.equal(view.hasRecord, true);
  assert.equal(view.entryCount, 1);
  assert.equal(view.mood, "4/5");
  assert.equal(view.energy, "3/5");
  assert.equal(view.sleep, "7小时30分钟");
  assert.equal(view.wearing, "今日已佩戴");
  assert.deepEqual(view.tags, ["平静", "专注"]);
  assert.equal(view.note, "今天状态稳定");
});

test("daily record empty state does not invent zero-valued health metrics", () => {
  const view = recordViewModel.buildDailyRecordView(null, copy);

  assert.equal(view.hasRecord, false);
  assert.equal(view.entryCount, 0);
  assert.equal(view.mood, "--");
  assert.equal(view.energy, "--");
  assert.equal(view.sleep, "暂无睡眠记录");
});

test("daily record page keeps load failures separate from a confirmed empty day", () => {
  const errorState = recordViewModel.buildDailyRecordPageState(null, {
    loading: false,
    loadError: "记录加载失败"
  }, copy);
  const emptyState = recordViewModel.buildDailyRecordPageState(null, {
    loading: false,
    loadError: ""
  }, copy);

  assert.equal(errorState.status, "error");
  assert.equal(errorState.canEdit, false);
  assert.equal(errorState.showEmpty, false);
  assert.equal(emptyState.status, "empty");
  assert.equal(emptyState.canEdit, true);
  assert.equal(emptyState.showEmpty, true);
});

test("failed undo remains visible and retryable until recovery succeeds", () => {
  const failed = recordViewModel.buildUndoView("failed");
  const restoring = recordViewModel.buildUndoView("restoring");
  const idle = recordViewModel.buildUndoView("idle");

  assert.deepEqual(failed, { visible: true, canRetry: true, restoring: false });
  assert.deepEqual(restoring, { visible: true, canRetry: false, restoring: true });
  assert.deepEqual(idle, { visible: false, canRetry: false, restoring: false });
});

test("data page loads daily-checkins instead of rendering static activity charts", () => {
  const root = path.resolve(__dirname, "../..");
  const logic = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.wxml"), "utf8");

  assert.ok(logic.includes("dailyCheckins.listByDate"));
  assert.ok(!logic.includes("buildActivity"));
  assert.ok(!view.includes("chart-bars"));
  assert.ok(!view.includes("activity.steps"));
});

test("sleep detail shows only recorded duration and no invented stage distribution", () => {
  const root = path.resolve(__dirname, "../..");
  const logic = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/sleep-detail/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/sleep-detail/index.wxml"), "utf8");

  assert.ok(logic.includes("dailyCheckins.listByDate"));
  assert.ok(!logic.includes("buildStages"));
  assert.ok(!view.includes("timeline-segment"));
  assert.ok(!view.includes("copy.view"));
  assert.ok(view.includes("copy.stageUnavailable"));
});
