const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

function installMiniappGlobals() {
  global.wx = {
    getStorageSync() { return ""; },
    setStorageSync() {},
    removeStorageSync() {},
    showToast() {},
    showModal() {}
  };
  global.getApp = () => ({ globalData: { navLayout: null } });
}

function loadPage(relativePath) {
  installMiniappGlobals();
  let definition = null;
  global.Page = (value) => { definition = value; };
  const modulePath = path.join(root, relativePath);
  delete require.cache[require.resolve(modulePath)];
  require(modulePath);
  return definition;
}

function createPage(definition, data) {
  const page = Object.assign({}, definition);
  page.data = Object.assign({}, definition.data, data || {});
  page.setData = (patch) => Object.assign(page.data, patch);
  return page;
}

function rejectedUnauthorized() {
  return Promise.reject(Object.assign(new Error("expired"), { statusCode: 401 }));
}

function settlePromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("home leaves its loading state when a daily-record request expires", async () => {
  const auth = require("../../utils/auth");
  const dailyCheckins = require("../../utils/daily-checkins");
  const originalLoggedIn = auth.isLoggedIn;
  const originalList = dailyCheckins.listByDate;
  auth.isLoggedIn = () => true;
  dailyCheckins.listByDate = rejectedUnauthorized;

  try {
    const page = createPage(loadPage("pages/home/index.js"));
    page.refreshDailyState();
    await settlePromises();
    assert.notEqual(page.data.dailyStatus, "loading");
  } finally {
    auth.isLoggedIn = originalLoggedIn;
    dailyCheckins.listByDate = originalList;
  }
});

test("record editor is not permanently saving after an expired request", async () => {
  const dailyCheckins = require("../../utils/daily-checkins");
  const originalSave = dailyCheckins.save;
  dailyCheckins.save = rejectedUnauthorized;

  try {
    const page = createPage(loadPage("subpackage/jewelry/pages/data/index.js"), {
      saving: false
    });
    page.saveRecord({ detail: {} });
    await settlePromises();
    assert.equal(page.data.saving, false);
  } finally {
    dailyCheckins.save = originalSave;
  }
});

test("record page leaves its loading state when authentication expires", async () => {
  const dailyCheckins = require("../../utils/daily-checkins");
  const originalList = dailyCheckins.listByDate;
  dailyCheckins.listByDate = rejectedUnauthorized;

  try {
    const page = createPage(loadPage("subpackage/jewelry/pages/data/index.js"), {
      loading: false
    });
    page.loadDailyRecord();
    await settlePromises();
    assert.equal(page.data.loading, false);
  } finally {
    dailyCheckins.listByDate = originalList;
  }
});

test("failed unauthorized undo remains retryable instead of restoring forever", async () => {
  const dailyCheckins = require("../../utils/daily-checkins");
  const originalSave = dailyCheckins.save;
  dailyCheckins.save = rejectedUnauthorized;

  try {
    const page = createPage(loadPage("subpackage/jewelry/pages/data/index.js"), {
      undoView: { visible: true, canRetry: true, restoring: false }
    });
    page.deletedRecord = { checkinDate: "2026-07-17" };
    page.undoDelete();
    await settlePromises();
    assert.equal(page.data.undoView.restoring, false);
    assert.equal(page.data.undoView.canRetry, true);
    if (page.undoTimer) clearTimeout(page.undoTimer);
  } finally {
    dailyCheckins.save = originalSave;
  }
});

test("sleep detail leaves its loading state when authentication expires", async () => {
  const dailyCheckins = require("../../utils/daily-checkins");
  const originalList = dailyCheckins.listByDate;
  dailyCheckins.listByDate = rejectedUnauthorized;

  try {
    const page = createPage(loadPage("subpackage/jewelry/pages/sleep-detail/index.js"), {
      loading: false
    });
    page.loadSleepRecord();
    await settlePromises();
    assert.equal(page.data.loading, false);
  } finally {
    dailyCheckins.listByDate = originalList;
  }
});
