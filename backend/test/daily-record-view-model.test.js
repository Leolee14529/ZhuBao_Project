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
  noNote: "暂无备注",
  weekDays: ["日", "一", "二", "三", "四", "五", "六"],
  weekRecordedUnit: "天",
  averageMoodUnit: "分",
  jewelryDaysUnit: "天",
  timesUnit: "次",
  noWeeklyRecords: "记录几天后，这里会出现你的节奏。",
  recordedNightsUnit: "晚",
  averageSleepEmpty: "--",
  noSleepTrend: "记录睡眠时长后，这里会形成趋势。",
  calmPace: "状态较稳，适合把注意力留给眼前的一件事。",
  gentlePace: "今天可以放慢一点，先照顾好自己的节奏。",
  brightPace: "今天的状态有光，可以顺着这份能量做喜欢的事。",
  jewelryCompanion: "饰品是今天的一份陪伴，不替代你的感受与判断。",
  noTodayFeeling: "完成今日记录后，这里会生成一条只基于真实记录的提示。"
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

test("weekly record view uses only real seven-day entries and keeps missing days empty", () => {
  const view = recordViewModel.buildWeeklyRecordView([
    { checkinDate: "2026-07-17", mood: 4, energy: 3, isWearingJewelry: true, tags: ["平静", "专注"] },
    { checkinDate: "2026-07-15", mood: 2, energy: 2, isWearingJewelry: false, tags: ["疲惫", "平静"] },
    { checkinDate: "2026-07-12", mood: 5, energy: 4, isWearingJewelry: true, tags: ["专注"] }
  ], "2026-07-17", copy);

  assert.equal(view.hasRecords, true);
  assert.equal(view.recordedDays, "3天");
  assert.equal(view.averageMood, "3.7分");
  assert.equal(view.jewelryDays, "2天");
  assert.equal(view.days.length, 7);
  assert.deepEqual(view.days.map((day) => day.value), [null, 5, null, null, 2, null, 4]);
  assert.deepEqual(view.topFeelings, [
    { label: "专注", count: 2, countText: "2次" },
    { label: "平静", count: 2, countText: "2次" },
    { label: "疲惫", count: 1, countText: "1次" }
  ]);
});

test("weekly record view gives an honest empty state instead of zero statistics", () => {
  const view = recordViewModel.buildWeeklyRecordView([], "2026-07-17", copy);

  assert.equal(view.hasRecords, false);
  assert.equal(view.recordedDays, "--");
  assert.equal(view.averageMood, "--");
  assert.equal(view.jewelryDays, "--");
  assert.equal(view.summary, copy.noWeeklyRecords);
  assert.ok(view.days.every((day) => day.value === null));
});

test("weekly record view survives a stale locale payload during hot reload", () => {
  const staleCopy = { noWeeklyRecords: "暂无", weekRecordedUnit: "天", averageMoodUnit: "分", jewelryDaysUnit: "天", timesUnit: "次" };
  const view = recordViewModel.buildWeeklyRecordView([], "2026-07-17", staleCopy);

  assert.equal(view.days.length, 7);
  assert.equal(view.days[6].dateKey, "2026-07-17");
});

test("today feeling stays grounded in the saved record", () => {
  const feeling = recordViewModel.buildTodayFeeling({
    mood: 2,
    energy: 2,
    isWearingJewelry: true
  }, copy);

  assert.equal(feeling.hasRecord, true);
  assert.equal(feeling.title, copy.gentlePace);
  assert.equal(feeling.detail, copy.jewelryCompanion);
  assert.deepEqual(recordViewModel.buildTodayFeeling(null, copy), {
    hasRecord: false,
    title: copy.noTodayFeeling,
    detail: ""
  });
});

test("data page loads daily-checkins instead of rendering static activity charts", () => {
  const root = path.resolve(__dirname, "../..");
  const logic = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/data/index.wxml"), "utf8");

  assert.ok(logic.includes("dailyCheckins.listRange"));
  assert.ok(!logic.includes("buildActivity"));
  assert.ok(!view.includes("chart-bars"));
  assert.ok(!view.includes("activity.steps"));
});

test("sleep detail shows only recorded duration and no invented stage distribution", () => {
  const root = path.resolve(__dirname, "../..");
  const logic = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/sleep-detail/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "subpackage/jewelry/pages/sleep-detail/index.wxml"), "utf8");

  assert.ok(logic.includes("dailyCheckins.listRange"));
  assert.ok(!logic.includes("buildStages"));
  assert.ok(!view.includes("timeline-segment"));
  assert.ok(!view.includes("copy.view"));
  assert.ok(view.includes("copy.stageUnavailable"));
});

test("sleep range follows the selected day, seven-day, and thirty-day windows", () => {
  assert.deepEqual(recordViewModel.buildSleepRange("2026-07-17", "day"), {
    from: "2026-07-17", to: "2026-07-17", limit: 1, days: 1
  });
  assert.deepEqual(recordViewModel.buildSleepRange("2026-07-17", "week"), {
    from: "2026-07-11", to: "2026-07-17", limit: 7, days: 7
  });
  assert.deepEqual(recordViewModel.buildSleepRange("2026-07-17", "month"), {
    from: "2026-06-18", to: "2026-07-17", limit: 30, days: 30
  });
});

test("sleep trend summarizes only saved sleep durations and leaves missing days empty", () => {
  const view = recordViewModel.buildSleepTrend([
    { checkinDate: "2026-07-17", sleepMinutes: 450 },
    { checkinDate: "2026-07-15", sleepMinutes: 390 },
    { checkinDate: "2026-07-12", sleepMinutes: 480 },
    { checkinDate: "2026-07-01", sleepMinutes: 60 }
  ], "2026-07-17", "week", copy);

  assert.equal(view.hasRecords, true);
  assert.equal(view.recordedNights, "3晚");
  assert.equal(view.averageSleep, "7小时20分钟");
  assert.equal(view.points.length, 7);
  assert.deepEqual(view.points.map((point) => point.minutes), [null, 480, null, null, 390, null, 450]);
  assert.ok(view.points.filter((point) => point.minutes !== null).every((point) => point.barHeight >= 28));
});

test("sleep trend has an honest empty state without zero sleep statistics", () => {
  const view = recordViewModel.buildSleepTrend([], "2026-07-17", "week", copy);

  assert.equal(view.hasRecords, false);
  assert.equal(view.recordedNights, "--");
  assert.equal(view.averageSleep, "--");
  assert.equal(view.summary, copy.noSleepTrend);
  assert.ok(view.points.every((point) => point.minutes === null));
});
