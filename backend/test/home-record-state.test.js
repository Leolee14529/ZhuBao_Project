const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");
const modulePath = path.join(root, "utils/home-record-state.js");
const copy = {
  signInToRecord: "登录后记录今天",
  loadingRecord: "正在读取今日记录",
  recordUnavailable: "记录暂不可用",
  recordToday: "记录今天",
  viewToday: "查看今日记录"
};

test("home record action does not present a failed lookup as an empty day", () => {
  assert.equal(fs.existsSync(modulePath), true);
  const state = require(modulePath);

  assert.deepEqual(state.buildAction({ loggedIn: true, status: "error" }, copy), {
    label: "记录暂不可用",
    disabled: true
  });
  assert.deepEqual(state.buildAction({ loggedIn: true, status: "ready", hasRecord: false }, copy), {
    label: "记录今天",
    disabled: false
  });
  assert.deepEqual(state.buildAction({ loggedIn: false, status: "idle" }, copy), {
    label: "登录后记录今天",
    disabled: false
  });
});

test("home record state remains isolated after the middle CTA is removed", () => {
  const logic = fs.readFileSync(path.join(root, "pages/home/index.js"), "utf8");
  const view = fs.readFileSync(path.join(root, "pages/home/index.wxml"), "utf8");

  assert.ok(logic.includes("homeRecordState.buildAction"));
  assert.ok(!view.includes('disabled="{{primaryActionDisabled}}"'));
  assert.ok(!view.includes('class="primary-action"'));
});
