const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("login keeps the layered WeChat and account entry layout", () => {
  const view = read("pages/login/index.wxml");

  assert.ok(view.includes("mode-tabs-indicator"));
  assert.ok(view.includes("auth-panel-stage"));
  assert.ok(view.includes("auth-panel-wechat"));
  assert.ok(view.includes("auth-panel-account"));
});

test("data page keeps real daily-record and honest sleep surfaces", () => {
  const view = read("subpackage/jewelry/pages/data/index.wxml");
  const logic = read("subpackage/jewelry/pages/data/index.js");
  const app = JSON.parse(read("app.json"));
  const jewelry = app.subPackages.find((item) => item.root === "subpackage/jewelry");

  assert.ok(view.includes("sleep-entry"));
  assert.ok(view.includes("record.mood"));
  assert.ok(view.includes("record.energy"));
  assert.ok(!view.includes("activity.steps"));
  assert.ok(!view.includes("chart-bars"));
  assert.ok(logic.includes("openSleepDetail"));
  assert.ok(jewelry.pages.includes("pages/sleep-detail/index"));
});

test("root home stays on the restored home experience instead of redirecting to the legacy subpackage page", () => {
  const logic = read("pages/home/index.js");
  const view = read("pages/home/index.wxml");

  assert.ok(!logic.includes('"/subpackage/jewelry/pages/home/index"'));
  assert.ok(view.includes("inspiration-card"));
  assert.ok(view.includes("mood-card"));
  assert.ok(view.includes("bottom-nav"));
});

test("main-package home does not load its dock from a subpackage", () => {
  const homeConfig = JSON.parse(read("pages/home/index.json"));
  const dockPath = homeConfig.usingComponents && homeConfig.usingComponents["bottom-nav"];

  assert.equal(dockPath, "/components/bottom-nav/bottom-nav");
});

test("app registers only the root home as the canonical home page", () => {
  const app = JSON.parse(read("app.json"));
  const jewelry = app.subPackages.find((item) => item.root === "subpackage/jewelry");

  assert.equal(app.pages[0], "pages/home/index");
  assert.equal(jewelry.pages.includes("pages/home/index"), false);
});

test("legacy subpackage home files are removed and the shared dock is complete", () => {
  const legacyHome = ["js", "json", "wxml", "wxss"].map((extension) => {
    return path.join(root, `subpackage/jewelry/pages/home/index.${extension}`);
  });
  const sharedDock = ["js", "json", "wxml", "wxss"].map((extension) => {
    return path.join(root, `components/bottom-nav/bottom-nav.${extension}`);
  });

  assert.ok(legacyHome.every((file) => !fs.existsSync(file)));
  assert.ok(sharedDock.every((file) => fs.existsSync(file)));
});

test("all jewelry navigation surfaces use the same localized bottom-nav component", () => {
  const homeView = read("pages/home/index.wxml");
  const homeConfig = JSON.parse(read("pages/home/index.json"));
  const navView = read("components/bottom-nav/bottom-nav.wxml");
  const navStyle = read("components/bottom-nav/bottom-nav.wxss");

  assert.ok(homeConfig.usingComponents && homeConfig.usingComponents["bottom-nav"]);
  assert.ok(homeView.includes('<bottom-nav active="home"></bottom-nav>'));
  assert.ok(!homeView.includes('class="bottom-nav"'));
  assert.ok(navView.includes("{{item.label}}"));
  assert.match(navStyle, /font-size:\s*26rpx/);
  assert.match(navStyle, /min-height:\s*96rpx/);
});

test("page styles do not redefine selectors owned by the shared bottom-nav", () => {
  const activePageStyles = [
    "pages/home/index.wxss",
    "subpackage/jewelry/pages/data/index.wxss",
    "subpackage/jewelry/pages/settings/index.wxss"
  ].map(read).join("\n");

  assert.doesNotMatch(activePageStyles, /(^|})\s*\.bottom-nav\b/);
  assert.doesNotMatch(activePageStyles, /(^|,|})\s*\.nav-item(?:\b|[:.])/);
});

test("login delegates redirect validation to the canonical auth boundary", () => {
  const auth = read("utils/auth.js");
  const login = read("pages/login/index.js");

  assert.ok(auth.includes('"/subpackage/jewelry/pages/sleep-detail/index"'));
  assert.ok(auth.includes("getSafeLoginRedirect"));
  assert.ok(login.includes("auth.getSafeLoginRedirect"));
  assert.ok(!login.includes('redirect === "/subpackage/'));
});

test("primary navigation replaces pages without destroying the visible page first", () => {
  const navigation = read("utils/navigation.js");
  const navLogic = read("components/bottom-nav/bottom-nav.js");

  assert.ok(navigation.includes("wx.navigateTo"));
  assert.ok(navigation.includes("wx.navigateBack"));
  assert.ok(!navLogic.includes("wx.redirectTo"));
});

test("all active home entry points use the root home page", () => {
  const auth = read("utils/auth.js");
  const share = read("utils/share.js");
  const fiveElements = read("subpackage/jewelry/pages/five-elements/index.js");

  assert.match(auth, /const HOME_URL = "\/pages\/home\/index"/);
  assert.match(share, /const HOME_SHARE_PATH = "\/pages\/home\/index"/);
  assert.match(fiveElements, /url: "\/pages\/home\/index"/);
});

test("settings does not present non-functional sleep and notification toggles", () => {
  const logic = read("subpackage/jewelry/pages/settings/index.js");
  const view = read("subpackage/jewelry/pages/settings/index.wxml");
  const settingsViewModel = require("../../subpackage/jewelry/utils/settings-view-model");
  const sections = settingsViewModel.buildSections({
    device: "Device", preferences: "Preferences", ring: "Ring", sleep: "Sleep",
    notifications: "Notifications", language: "Language", unavailable: "Not available"
  });

  assert.ok(!logic.includes("sleepEnabled"));
  assert.ok(!logic.includes("notificationsEnabled"));
  assert.ok(!logic.includes("onToggleTap"));
  assert.ok(!view.includes('class="toggle'));
  assert.ok(sections.flatMap((section) => section.items).every((item) => !item.toggle));
  assert.equal(sections[0].items[1].value, "Not available");
});

test("home does not expose dead device and more-reference actions", () => {
  const logic = read("pages/home/index.js");
  const view = read("pages/home/index.wxml");

  assert.ok(!logic.includes("openProducts"));
  assert.ok(!logic.includes("openDevice"));
  assert.ok(!view.includes('bindtap="openProducts"'));
  assert.ok(!view.includes('bindtap="openDevice"'));
  assert.ok(!view.includes("device.battery"));
});

test("home exposes one stateful daily-record action backed by real check-ins", () => {
  const logic = read("pages/home/index.js");
  const view = read("pages/home/index.wxml");

  assert.ok(logic.includes("dailyCheckins.listByDate"));
  assert.ok(logic.includes("openDailyRecord"));
  assert.ok(view.includes('class="primary-action"'));
  assert.ok(view.includes('bindtap="openDailyRecord"'));
});

test("successful daily-record save replaces the empty panel with the saved record", () => {
  const logic = read("subpackage/jewelry/pages/data/index.js");
  const saveFlow = logic.slice(logic.indexOf("saveRecord(event)"), logic.indexOf("deleteRecord()"));

  assert.match(saveFlow, /canEdit:\s*true/);
  assert.match(saveFlow, /showEmpty:\s*false/);
  assert.match(saveFlow, /this\.clearUndoState\(\)/);
});

test("navigation and layout helpers avoid warning noise and deprecated system info", () => {
  const app = read("app.js");
  const dock = read("components/bottom-nav/bottom-nav.js");

  assert.ok(app.includes("wx.getWindowInfo"));
  assert.ok(!app.includes("wx.getSystemInfoSync"));
  assert.ok(!dock.includes("console.warn"));
  assert.ok(!app.includes("routeDebug"));
});
