const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { PROHIBITED_REVIEW_TERMS } = require("./helpers/review-policy");

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

test("login page stays within one screen without a duplicate status bar", () => {
  const appStyle = readText("app.wxss");
  const loginPage = readText("pages/login/index.wxml");
  const loginStyle = readText("pages/login/index.wxss");
  const i18nCopy = readText("utils/i18n-copy.js");

  assert.ok(appStyle.includes("min-height: 100vh"));
  assert.ok(loginPage.includes("class=\"login-page\""));
  assert.ok(loginPage.includes("class=\"login-bg\""));
  assert.ok(loginPage.includes("class=\"brand-name\""));
  assert.ok(loginPage.includes("copy.wechatLogin"));
  assert.equal(loginPage.includes("<status-bar>"), false);
  assert.ok(i18nCopy.includes('wechatLogin: "微信登录"'));
  assert.match(loginStyle, /\.login-page\{[^}]*height:100vh/);
  assert.match(loginStyle, /\.login-page\{[^}]*overflow:hidden/);
  assert.match(loginStyle, /\.login-page\{[^}]*background:#000/);
});

test("login page exposes account password entry wired to backend auth", () => {
  const loginPage = readText("pages/login/index.wxml");
  const loginLogic = readText("pages/login/index.js");
  const migration = readText("backend/db/migrations/002_account_password_login.sql");
  const i18nCopy = readText("utils/i18n-copy.js");

  assert.ok(loginPage.includes("mode-tab"));
  assert.ok(loginPage.includes("accountAuthEnabled"));
  assert.ok(loginPage.includes("copy.accountLogin"));
  assert.ok(loginPage.includes("copy.createAccount"));
  assert.ok(i18nCopy.includes('accountLogin: "账号登录"'));
  assert.ok(i18nCopy.includes('createAccount: "创建账号"'));
  assert.ok(loginLogic.includes("accountAuthEnabled: true"));
  assert.ok(loginLogic.includes("/api/auth/account-login"));
  assert.ok(loginLogic.includes("/api/auth/account-register"));
  assert.ok(readText("utils/config.js").includes("isAccountAuthEnabled"));
  assert.ok(readText("utils/request.js").includes("isAuthEntryPath"));
  assert.ok(migration.includes("account_name"));
  assert.ok(migration.includes("password_hash"));
});

test("account password entry is enabled by default unless explicitly disabled", () => {
  function loadConfig(extConfig) {
    global.wx = {
      getExtConfigSync() { return extConfig; },
      getAccountInfoSync() { return { miniProgram: { envVersion: "release" } }; }
    };
    delete require.cache[require.resolve("../../utils/config")];
    return require("../../utils/config");
  }

  assert.equal(loadConfig({}).isAccountAuthEnabled(), true);
  assert.equal(loadConfig({ enableAccountAuth: true }).isAccountAuthEnabled(), true);
  assert.equal(loadConfig({ enableAccountAuth: false }).isAccountAuthEnabled(), false);
  assert.equal(loadConfig({ enableAccountAuth: "false" }).isAccountAuthEnabled(), false);
});

test("release login defaults to wechat before account password", () => {
  const loginPage = readText("pages/login/index.wxml");
  const loginLogic = readText("pages/login/index.js");
  const wechatTabIndex = loginPage.indexOf('data-mode="wechat"');
  const accountTabIndex = loginPage.indexOf('data-mode="account"');

  assert.ok(loginLogic.includes('loginMode: "wechat"'));
  assert.ok(loginLogic.includes("accountAuthEnabled"));
  assert.ok(wechatTabIndex >= 0);
  assert.ok(accountTabIndex > wechatTabIndex);
});

test("period setup exposes an in-sheet data notice confirmation", () => {
  const calendarPage = readText("subpackage/periodCalendar/pages/calendar/index.wxml");
  const calendarLogic = readText("subpackage/periodCalendar/pages/calendar/index.js");
  const i18nCopy = readText("utils/i18n-copy.js");

  assert.ok(calendarPage.includes("copy.privacyTitle"));
  assert.ok(i18nCopy.includes('privacyTitle: "我已知晓经期数据说明"'));
  assert.ok(calendarPage.includes("bindtap=\"onToggleCyclePrivacy\""));
  assert.ok(calendarLogic.includes("cyclePrivacyConfirmed"));
  assert.ok(calendarLogic.includes("auth.getPersonalData(auth.PERIOD_PRIVACY_KEY)"));
  assert.ok(calendarLogic.includes("ensureCyclePrivacyReady"));
});

test("period calendar is a safe login restore target", () => {
  const authLogic = readText("utils/auth.js");
  const loginLogic = readText("pages/login/index.js");
  const periodRoute = "/subpackage/periodCalendar/pages/calendar/index";

  assert.ok(authLogic.includes(periodRoute));
  assert.ok(loginLogic.includes("auth.getSafeLoginRedirect"));
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

test("review entry opens the browseable home before login", () => {
  const appConfig = JSON.parse(readText("app.json"));
  assert.equal(appConfig.pages[0], "pages/home/index");

  const entrySource = readText("pages/home/index.js");
  assert.equal(entrySource.includes("/subpackage/jewelry/pages/home/index"), false);
  assert.equal(entrySource.includes("inspiration"), true);
  assert.equal(entrySource.includes("wx.login"), false);
  assert.equal(entrySource.includes("requirePrivacyAuthorize"), false);
  const onLoadSource = entrySource.slice(entrySource.indexOf("onLoad()"), entrySource.indexOf("onShow()"));
  assert.equal(onLoadSource.includes("requireLogin"), false);
});

test("active client does not request phone, nickname, or avatar interfaces", () => {
  const files = [
    ...listFiles("pages", [".js", ".json", ".wxml"]),
    ...listFiles("components", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/jewelry", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/periodCalendar", [".js", ".json", ".wxml"])
  ];
  const forbiddenInterfaces = [
    "getPhoneNumber",
    "getUserProfile",
    "getUserInfo",
    "chooseAvatar",
    "open-type=\"getPhoneNumber\"",
    "open-type=\"chooseAvatar\"",
    "type=\"nickname\""
  ];

  for (const file of files) {
    const text = readText(file);
    for (const interfaceName of forbiddenInterfaces) {
      assert.equal(
        text.includes(interfaceName),
        false,
        `${file} references privacy interface ${interfaceName}`
      );
    }
  }
});

test("five-element preview is available before login", () => {
  const source = readText("subpackage/jewelry/pages/five-elements/index.js");
  const i18nCopy = readText("utils/i18n-copy.js");
  const onLoadSource = source.slice(
    source.indexOf("onLoad: function"),
    source.indexOf("onDateChange: function")
  );
  assert.equal(onLoadSource.includes("requireLogin"), false);
  assert.equal(source.includes('i18n.t("five.loginToSave")'), true);
  assert.equal(i18nCopy.includes('loginToSave: "登录后可保存和同步五行结果"'), true);
});

test("active review text does not contain prohibited promise language", () => {
  const files = [
    ...listFiles("pages", [".js", ".wxml"]),
    ...listFiles("subpackage", [".js", ".json", ".wxml"]),
    ...listFiles("backend/routes", [".js"]),
    ...listFiles("backend/services", [".js"]),
    ...listFiles("backend/scripts", [".js"]),
    "backend/app.js",
    "backend/README.md",
    "utils/i18n-copy.js",
    "交接文档.md"
  ];
  for (const file of files) {
    const text = readText(file).toLowerCase();
    for (const word of PROHIBITED_REVIEW_TERMS) {
      assert.equal(text.includes(word), false, `${file} contains prohibited word ${word}`);
    }
  }
});

test("release project config keeps request-domain validation enabled", () => {
  const config = JSON.parse(readText("project.config.json"));

  assert.equal(config.setting && config.setting.urlCheck, true);
});

test("privacy policy discloses every server-side daily record field", () => {
  const copy = require("../../utils/i18n-copy");
  const chinese = copy["zh-CN"].legal.privacyParagraphs.join("\n");
  const english = copy["en-US"].legal.privacyParagraphs.join("\n");

  assert.ok(chinese.includes("心情、精力、睡眠时长、饰品佩戴状态、标签和备注"));
  assert.ok(chinese.includes("保存在服务器"));
  assert.ok(english.includes("mood, energy, sleep duration, jewelry-wearing status, tags, and notes"));
  assert.ok(english.includes("stored on the server"));
});
