const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function listFiles(dir, extensions) {
  const base = path.join(root, dir);
  const results = [];
  if (!fs.existsSync(base)) return results;
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const full = path.join(base, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      results.push(...listFiles(rel, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      results.push(rel);
    }
  }
  return results;
}

function listActiveReviewFiles() {
  return [
    ...listFiles("pages", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/jewelry", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/periodCalendar", [".js", ".json", ".wxml"]),
    "app.json"
  ];
}

function listRegisteredPages() {
  const appConfig = JSON.parse(readText("app.json"));
  const registered = new Set();

  for (const page of appConfig.pages || []) {
    registered.add(`/${page}`);
  }

  for (const subPackage of appConfig.subPackages || appConfig.subpackages || []) {
    const packageRoot = String(subPackage.root || "").replace(/^\/+|\/+$/g, "");
    for (const page of subPackage.pages || []) {
      registered.add(`/${packageRoot}/${page}`);
    }
  }

  return registered;
}

test("review package excludes unfinished routes from active surfaces", () => {
  const activeFiles = listActiveReviewFiles();
  const removedRoutePattern = /\/subpackage\/(auth|showcase|showcase-device|device12|device13|device17)\//;

  for (const file of activeFiles) {
    assert.equal(
      removedRoutePattern.test(readText(file)),
      false,
      `${file} references a route removed from the review package`
    );
  }
});

test("active page route references are registered in app.json", () => {
  const activeFiles = listActiveReviewFiles();
  const registeredPages = listRegisteredPages();
  const routePattern = /["'](\/(?:pages|subpackage)\/[^"']+)["']/g;
  const ignoredPathPattern = /\/(?:assets|components|utils)\//;
  const ignoredExtensionPattern = /\.(?:png|jpe?g|webp|gif|svg|json|js|wxml|wxss)$/i;

  for (const file of activeFiles) {
    const text = readText(file);
    let match;
    while ((match = routePattern.exec(text))) {
      const route = match[1].split("?")[0];
      if (ignoredPathPattern.test(route) || ignoredExtensionPattern.test(route)) {
        continue;
      }

      assert.equal(
        registeredPages.has(route),
        true,
        `${file} references unregistered page route ${route}`
      );
    }
  }
});

test("period setup exposes an in-sheet data notice confirmation", () => {
  const calendarPage = readText("subpackage/periodCalendar/pages/calendar/index.wxml");
  const calendarLogic = readText("subpackage/periodCalendar/pages/calendar/index.js");

  assert.ok(calendarPage.includes("我已知晓经期数据说明"));
  assert.ok(calendarPage.includes("bindtap=\"onToggleCyclePrivacy\""));
  assert.ok(calendarLogic.includes("cyclePrivacyConfirmed"));
});

test("auth state prefers token over guest mode and clears conflicts", () => {
  const storage = { token: "token-value", guestMode: true };
  global.wx = {
    getStorageSync(key) {
      return storage[key];
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    removeStorageSync(key) {
      delete storage[key];
    }
  };
  delete require.cache[require.resolve("../../utils/auth")];
  const auth = require("../../utils/auth");

  const state = auth.getAuthState();
  assert.equal(state.status, "loggedIn");
  assert.equal(storage.guestMode, undefined);
});

test("active review text does not contain prohibited promise language", () => {
  const files = [
    ...listFiles("pages", [".js", ".wxml"]),
    ...listFiles("subpackage/jewelry", [".js", ".wxml"]),
    ...listFiles("subpackage/periodCalendar", [".js", ".wxml"])
  ];
  const prohibited = [
    "治疗",
    "改善疾病",
    "调理身体",
    "疗愈",
    "保证",
    "必然有效",
    "助孕",
    "生育预测",
    "精准命理",
    "改运",
    "转运",
    "旺财"
  ];

  for (const file of files) {
    const text = readText(file);
    for (const word of prohibited) {
      assert.equal(text.includes(word), false, `${file} contains prohibited word ${word}`);
    }
  }
});
