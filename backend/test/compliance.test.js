const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const appSerifFontStack = "\"STSongti-SC-Regular\", \"Songti SC\", \"Noto Serif CJK SC\", \"Source Han Serif SC\", \"SimSun\", \"NSimSun\", serif";

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
    ...listFiles("components", [".js", ".json", ".wxml"]),
    ...listFiles("pages", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/jewelry", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/periodCalendar", [".js", ".json", ".wxml"]),
    "app.json"
  ];
}

function listFrontendStyleFiles() {
  return [
    "app.wxss",
    ...listFiles("components", [".wxss"]),
    ...listFiles("pages", [".wxss"]),
    ...listFiles("subpackage", [".wxss"])
  ];
}

function listFrontendTypographyFiles() {
  return [
    ...listFrontendStyleFiles(),
    ...listFiles("components", [".wxml", ".js"]),
    ...listFiles("pages", [".wxml", ".js"]),
    ...listFiles("subpackage", [".wxml", ".js"])
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

test("review package ignores stale demo routes and handoff documents", () => {
  const config = JSON.parse(readText("project.config.json"));
  const ignored = new Set((config.packOptions.ignore || []).map((item) => `${item.type}:${item.value}`));
  [
    "folder:subpackage/showcase",
    "folder:subpackage/showcase-device",
    "folder:subpackage/auth",
    "folder:subpackage/device12",
    "folder:subpackage/device13",
    "folder:subpackage/device17",
    "file:agent.md",
    "file:涓婄嚎鍑嗗.md",
    "file:浜ゆ帴鏂囨。.md"
  ].forEach((entry) => {
    assert.ok(ignored.has(entry), `project.config.json must ignore ${entry}`);
  });
});

test("frontend typography uses the unified serif stack", () => {
  const allowedFontFamilyFiles = new Set([
    "app.wxss",
    "subpackage/periodCalendar/styles/typography.wxss"
  ]);
  const appStyle = readText("app.wxss");
  const appFontBlock = appStyle.match(/([^{}]+)\{[^{}]*font-family\s*:[^{}]*\}/);
  const periodTypography = readText("subpackage/periodCalendar/styles/typography.wxss");

  assert.ok(appFontBlock, "app.wxss must declare a global font block");
  assert.match(appFontBlock[1], /\bpage\b/, "app.wxss global font block must include page");
  assert.match(appFontBlock[1], /\bcover-view\b/, "app.wxss global font block must include cover-view");
  assert.equal(
    /\.[\w-]+\s+(view|text|button|input|textarea|picker|label|cover-view)\b/.test(periodTypography),
    false,
    "period typography import must not use component descendant tag selectors"
  );

  for (const file of listFrontendTypographyFiles()) {
    const text = readText(file);
    const hasFontFamily = /font-family\s*:/.test(text);

    assert.equal(
      /font-weight\s*:\s*(bold|bolder|[6-9]00)\b/i.test(text) ||
        /font\s*:\s*(?!inherit\b)[^;}"']*(bold|bolder|[6-9]00)\b/i.test(text),
      false,
      `${file} uses a heavy font weight outside the unified type scale`
    );

    if (!allowedFontFamilyFiles.has(file)) {
      assert.equal(hasFontFamily, false, `${file} declares a page-level font family`);
      continue;
    }

    assert.ok(text.includes(appSerifFontStack), `${file} must use the app serif font stack`);
    assert.ok(
      text.includes("font-variant-numeric: lining-nums tabular-nums"),
      `${file} must keep numeric glyphs stable`
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
  const setupSheet = readText("subpackage/periodCalendar/components/cycle-setup-sheet/cycle-setup-sheet.wxml");
  const calendarLogic = readText("subpackage/periodCalendar/pages/calendar/index.js");

  assert.ok(calendarPage.includes("cycle-setup-sheet"));
  assert.ok(setupSheet.includes("我已知晓周期数据说明"));
  assert.ok(setupSheet.includes("bindtap=\"onToggleCyclePrivacy\""));
  assert.ok(calendarLogic.includes("cyclePrivacyConfirmed"));
  assert.ok(calendarLogic.includes("auth.getPersonalData(auth.PERIOD_PRIVACY_KEY)"));
  assert.ok(calendarLogic.includes("ensureCyclePrivacyReady"));
});

test("period calendar is a safe login restore target", () => {
  const authLogic = readText("utils/auth.js");
  const loginLogic = readText("pages/login/index.js");
  const periodRoute = "/subpackage/periodCalendar/pages/calendar/index";

  assert.ok(authLogic.includes(periodRoute));
  assert.ok(loginLogic.includes(periodRoute));
});

test("runtime wuxing data is not committed with the review package", () => {
  assert.equal(fs.existsSync(path.join(root, "backend/data/wuxing.json")), false);
  assert.ok(readText(".gitignore").includes("backend/data/wuxing.json"));
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
    ...listFiles("subpackage/periodCalendar", [".js", ".wxml"]),
    "utils/share.js"
  ];
  const prohibited = [
    "占卜",
    "抽签",
    "灵签",
    "算命",
    "命理",
    "运势",
    "吉凶",
    "中吉",
    "小吉",
    "疗愈",
    "治愈",
    "治疗",
    "诊断",
    "保证",
    "必然有效",
    "预测未来",
    "幸运元素",
    "当前推演结果",
    "基于您八字的佩戴建议",
    "预测经期",
    "专属预测",
    "预测日历",
    "倒计时结果",
    "已重新预测后续周期",
    "改善疾病",
    "调理身体",
    "助孕",
    "生育预测",
    "精准命理",
    "改运",
    "转运",
    "旺财",
    "排卵日",
    "易孕期",
    "安全期"
  ];
  const discouragedReviewPhrases = [
    "五行色彩",
    "出生资料",
    "出生日期和时刻",
    "元素更明显",
    "暂无元素参考数据"
  ];

  for (const file of files) {
    const text = readText(file);
    for (const word of [...prohibited, ...discouragedReviewPhrases]) {
      assert.equal(text.includes(word), false, `${file} contains prohibited word ${word}`);
    }
  }
});
