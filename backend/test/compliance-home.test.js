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
    ...listFiles("components", [".js", ".json", ".wxml"]),
    ...listFiles("pages", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/jewelry", [".js", ".json", ".wxml"]),
    ...listFiles("subpackage/periodCalendar", [".js", ".json", ".wxml"]),
    "app.json"
  ];
}

test("review package starts on the anonymous-safe main home page", () => {
  const appConfig = JSON.parse(readText("app.json"));
  const jewelryPackage = (appConfig.subPackages || []).find((item) => item.root === "subpackage/jewelry");
  const homeLogic = readText("pages/home/index.js");
  const homePage = readText("pages/home/index.wxml");
  const loginLogic = readText("pages/login/index.js");
  const authLogic = readText("utils/auth.js");
  const shareUtil = readText("utils/share.js");

  assert.equal(appConfig.pages[0], "pages/home/index");
  assert.equal((jewelryPackage.pages || []).includes("pages/home/index"), false);
  assert.equal(homeLogic.includes("wx.login"), false);
  assert.equal(homeLogic.includes("../../subpackage/"), false);
  assert.equal(homePage.includes("getPhoneNumber"), false);
  assert.equal(homePage.includes("getUserProfile"), false);
  assert.equal(homePage.includes("chooseAvatar"), false);
  assert.equal(loginLogic.includes("auth.enterGuestMode()"), false);
  assert.equal(authLogic.includes("enterGuestMode"), false);
  assert.equal(authLogic.includes("safeSet(GUEST_KEY"), false);
  assert.equal(authLogic.includes('status: "guest"'), false);
  assert.ok(shareUtil.includes('const HOME_SHARE_PATH = "/pages/home/index"'));
});

test("active code does not reference the removed subpackage home route", () => {
  const files = [
    ...listActiveReviewFiles(),
    "utils/auth.js",
    "utils/share.js"
  ];

  assert.equal(fs.existsSync(path.join(root, "subpackage/jewelry/pages/home/index.js")), false);

  for (const file of files) {
    assert.equal(
      readText(file).includes("/subpackage/jewelry/pages/home/index"),
      false,
      `${file} still references the removed subpackage home route`
    );
  }
});

test("login page keeps a visible first screen", () => {
  const appStyle = readText("app.wxss");
  const loginPage = readText("pages/login/index.wxml");
  const loginStyle = readText("pages/login/index.wxss");

  assert.ok(appStyle.includes("min-height: 100vh"));
  assert.ok(loginPage.includes("class=\"login-page\""));
  assert.ok(loginPage.includes("class=\"login-bg\""));
  assert.ok(loginPage.includes("class=\"brand-name\""));
  assert.ok(loginPage.includes("微信登录"));
  assert.match(loginStyle, /\.login-page\{[^}]*min-height:100vh/);
  assert.match(loginStyle, /\.login-page\{[^}]*overflow-y:auto/);
  assert.match(loginStyle, /\.login-page\{[^}]*background:#000/);
});

test("login page exposes account password entry wired to backend auth", () => {
  const loginPage = readText("pages/login/index.wxml");
  const loginLogic = readText("pages/login/index.js");
  const migration = readText("backend/db/migrations/002_account_password_login.sql");

  assert.ok(loginPage.includes("mode-tab"));
  assert.ok(loginPage.includes("accountAuthEnabled"));
  assert.ok(loginPage.includes("账号登录"));
  assert.ok(loginPage.includes("创建账号"));
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

test("daily inspiration card is local and does not request legacy card endpoints", () => {
  const homeConfig = readText("pages/home/index.json");
  const homePage = readText("pages/home/index.wxml");
  const homeLogic = readText("pages/home/index.js");

  assert.equal(homeConfig.includes("usingComponents"), false);
  assert.ok(homePage.includes("今日灵感"));
  assert.equal(homePage.includes("<inspiration-card"), false);
  assert.equal(homeLogic.includes("/api/fortunes"), false);
  assert.equal(homeLogic.includes("request.get"), false);
});

test("home page records today's mood locally without backend upload", () => {
  const homePage = readText("pages/home/index.wxml");
  const homeLogic = readText("pages/home/index.js");
  const authLogic = readText("utils/auth.js");

  ["平静", "疲惫", "紧绷", "期待", "低落"].forEach((label) => {
    assert.ok(homeLogic.includes(`label: "${label}"`), `home mood option missing ${label}`);
  });
  assert.ok(homePage.includes("bindtap=\"recordMood\""));
  assert.ok(homeLogic.includes("auth.DAILY_MOOD_KEY"));
  assert.ok(homeLogic.includes("auth.setPersonalData"));
  assert.equal(homeLogic.includes("/api/"), false);
  assert.ok(authLogic.includes('const DAILY_MOOD_KEY = "dailyMoodRecord"'));
  assert.ok(authLogic.includes("DAILY_MOOD_KEY"));
});

test("home page style imports are committed with the main page", () => {
  const style = readText("pages/home/index.wxss");
  const imports = Array.from(style.matchAll(/@import\s+"\.\/([^"]+)";/g))
    .map((match) => `pages/home/${match[1]}`);

  assert.deepEqual(imports, [
    "pages/home/inspiration.wxss",
    "pages/home/mood.wxss",
    "pages/home/content.wxss",
    "pages/home/nav.wxss"
  ]);
  imports.forEach((file) => {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
  });
});

test("main home page keeps its visible assets in the main package", () => {
  const homePage = readText("pages/home/index.wxml");
  const homeLogic = readText("pages/home/index.js");
  const homeAssets = [
    "pages/home/assets/device-bluetooth.png",
    "pages/home/assets/product-1.jpg",
    "pages/home/assets/product-2.jpg",
    "pages/home/assets/product-3.jpg",
    "pages/home/assets/product-4.jpg"
  ];

  assert.equal(homePage.includes("/subpackage/jewelry/assets/"), false);
  assert.equal(homeLogic.includes("/subpackage/jewelry/assets/"), false);
  homeAssets.forEach((file) => {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
  });
});
