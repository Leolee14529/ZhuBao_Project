const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..", "..");

function loadAuth(storage) {
  global.wx = {
    getStorageSync(key) { return storage[key]; },
    setStorageSync(key, value) { storage[key] = value; },
    removeStorageSync(key) { delete storage[key]; },
    reLaunch(options) {
      if (options && typeof options.complete === "function") options.complete();
    },
    showToast() {}
  };
  delete require.cache[require.resolve("../../utils/auth")];
  return require("../../utils/auth");
}

function loadMoodRuntime(storage, requestImpl) {
  const auth = loadAuth(storage);
  const requestPath = require.resolve("../../utils/request");
  const runtimePath = require.resolve("../../pages/home/mood-runtime");
  delete require.cache[requestPath];
  const request = require(requestPath);
  request.request = requestImpl;
  delete require.cache[runtimePath];
  return { auth, runtime: require(runtimePath) };
}

function loadHomePage(auth, runtime) {
  const filename = path.join(ROOT, "pages/home/index.js");
  const source = fs.readFileSync(filename, "utf8");
  let definition = null;
  vm.runInNewContext(source, {
    require(requestPath) {
      if (requestPath === "../../utils/auth") return auth;
      if (requestPath === "./mood-runtime") return runtime;
      if (requestPath === "../../utils/share") {
        return {
          enableShareMenu() {},
          getHomeShareAppMessage() { return {}; },
          getHomeShareTimeline() { return {}; }
        };
      }
      throw new Error("Unexpected home dependency: " + requestPath);
    },
    Page(value) { definition = value; },
    getApp() { return { globalData: {} }; },
    wx: {},
    console,
    Date,
    Math,
    Promise,
    setTimeout,
    clearTimeout
  }, { filename });
  return definition;
}

function createPage(definition) {
  const page = Object.assign({}, definition);
  page.data = JSON.parse(JSON.stringify(definition.data));
  page.setDataCount = 0;
  page.setData = function setData(nextData) {
    this.setDataCount += 1;
    Object.assign(this.data, nextData);
  };
  page.isPageUnloaded = false;
  return page;
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("personal local data is scoped to the authenticated user", () => {
  const storage = {};
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-a", { id: "a" });
  auth.setPersonalData(auth.WUXING_KEY, { owner: "a" });
  auth.setPersonalData(auth.DAILY_MOOD_KEY, { date: "2026-07-08", moodId: "calm" });
  auth.acceptAuthenticatedSession("token-b", { id: "b" });

  assert.equal(auth.getPersonalData(auth.WUXING_KEY), undefined);
  assert.equal(auth.getPersonalData(auth.DAILY_MOOD_KEY), undefined);
  auth.setPersonalData(auth.WUXING_KEY, { owner: "b" });
  auth.acceptAuthenticatedSession("token-a2", { id: "a" });

  assert.deepEqual(auth.getPersonalData(auth.WUXING_KEY), { owner: "a" });
  assert.deepEqual(auth.getPersonalData(auth.DAILY_MOOD_KEY), { date: "2026-07-08", moodId: "calm" });
});

test("auth transitions remove legacy global personal keys", () => {
  const storage = { jewelryWuxingResult: { legacy: true }, dailyMoodRecord: { legacy: true } };
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-c", { id: "c" });

  assert.equal(storage.jewelryWuxingResult, undefined);
  assert.equal(storage.dailyMoodRecord, undefined);
});

test("clearing local data removes current account data and legacy guest state", () => {
  const storage = { guestMode: true };
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-d", { id: "d" });
  auth.setPersonalData(auth.CYCLE_KEY, { cycleLength: "28" });
  auth.setPersonalData(auth.DAILY_MOOD_KEY, { date: "2026-07-08", moodId: "calm" });
  storage["dailyMoodRecord:anonymous"] = { date: "2026-07-08", moodId: "low" };
  storage["periodCalendarCycleProfile:guest"] = { cycleLength: "31" };
  auth.clearAllLocalPersonalData();

  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.equal(storage.guestMode, undefined);
  assert.equal(storage["periodCalendarCycleProfile:user:d"], undefined);
  assert.equal(storage["dailyMoodRecord:user:d"], undefined);
  assert.equal(storage["dailyMoodRecord:anonymous"], undefined);
  assert.equal(storage["periodCalendarCycleProfile:guest"], undefined);
});

test("invalidating an expired session clears the original owner before auth state", () => {
  const guestId = "guest_valid-owner_1234";
  const storage = {
    privacyConsentAccepted: true,
    dailyMoodGuestId: guestId,
    jewelryBirthProfile: { legacy: true },
    "dailyMoodRecord:anonymous": { moodId: "anonymous" }
  };
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("expired-token", { id: "expired-owner" });
  auth.setPersonalData(auth.BIRTH_KEY, { birthDate: "2000-01-01" });
  auth.setPersonalData(auth.CYCLE_KEY, { cycleLength: "28" });
  auth.setPersonalData(auth.DAILY_MOOD_KEY, { moodId: "calm" });
  const invalidatedOwner = auth.invalidateAuthenticatedSession();

  assert.equal(invalidatedOwner, "user:expired-owner");
  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.equal(storage["jewelryBirthProfile:user:expired-owner"], undefined);
  assert.equal(storage["periodCalendarCycleProfile:user:expired-owner"], undefined);
  assert.equal(storage["dailyMoodRecord:user:expired-owner"], undefined);
  assert.deepEqual(storage["dailyMoodRecord:anonymous"], { moodId: "anonymous" });
  assert.equal(storage.privacyConsentAccepted, true);
  assert.equal(storage.dailyMoodGuestId, guestId);
});

test("guest mood id requires consent and repairs invalid stored values", () => {
  const storage = { dailyMoodGuestId: "guest invalid value" };
  const auth = loadAuth(storage);

  assert.equal(auth.getMoodGuestId(), "");
  assert.equal(storage.dailyMoodGuestId, "guest invalid value");
  auth.acceptPrivacyConsent();

  const repaired = auth.getMoodGuestId();
  assert.match(repaired, /^guest_[a-zA-Z0-9_.:-]{8,80}$/);
  assert.notEqual(repaired, "guest invalid value");
  assert.equal(storage.dailyMoodGuestId, repaired);
  assert.equal(auth.getMoodGuestId(), repaired);
});

test("anonymous mood runtime does not request or create guest id before consent", async () => {
  const storage = {};
  let requestCalls = 0;
  let guestIdCalls = 0;
  const loaded = loadMoodRuntime(storage, () => {
    requestCalls += 1;
    return Promise.resolve({});
  });

  const result = await loaded.runtime.fetchToday({
    getGuestId() {
      guestIdCalls += 1;
      return "guest_should_not_be_used";
    }
  });

  assert.equal(result.skipped, true);
  assert.equal(result.owner, "anonymous");
  assert.equal(requestCalls, 0);
  assert.equal(guestIdCalls, 0);
  assert.equal(storage.dailyMoodGuestId, undefined);
});

test("401 mood fallback clears the user owner before requesting as guest", async () => {
  const storage = {};
  const calls = [];
  const loaded = loadMoodRuntime(storage, (options) => {
    calls.push(options);
    if (calls.length === 1) return Promise.reject({ statusCode: 401 });
    return Promise.resolve({ mood: { mood_id: "guest-mood" } });
  });
  loaded.auth.acceptPrivacyConsent();
  loaded.auth.acceptAuthenticatedSession("expired-token", { id: "owner-a" });
  loaded.auth.setPersonalData(loaded.auth.BIRTH_KEY, { owner: "a" });

  const result = await loaded.runtime.fetchToday();

  assert.equal(calls.length, 2);
  assert.equal(result.owner, "anonymous");
  assert.equal(result.data.mood.mood_id, "guest-mood");
  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.equal(storage["jewelryBirthProfile:user:owner-a"], undefined);
  assert.match(calls[1].header["X-Guest-Id"], /^guest_[a-zA-Z0-9_.:-]{8,80}$/);
  assert.equal(calls[1].includeAuth, false);
});

test("home keeps a stable fallback before privacy consent", () => {
  let fetchCalls = 0;
  const auth = {
    DAILY_MOOD_KEY: "dailyMoodRecord",
    getToken() { return ""; },
    hasPrivacyConsent() { return false; },
    getPersonalOwner() { return "anonymous"; },
    getPersonalData() { return null; },
    getMoodGuestId() { throw new Error("guest id must not be created"); }
  };
  const runtime = {
    buildView(mood) { return { mood }; },
    getCycleDate() { return "2026-07-09"; },
    fetchToday() { fetchCalls += 1; return Promise.resolve({}); }
  };
  const page = createPage(loadHomePage(auth, runtime));

  page.refreshTodayMood();
  page.refreshTodayMood();

  assert.equal(fetchCalls, 0);
  assert.equal(page.data.mood.name, "今天也慢慢来");
  assert.equal(page.setDataCount, 1);
});

test("home ignores mood responses after unload or owner change", async () => {
  let owner = "anonymous";
  let cacheWrites = 0;
  const pending = [];
  const auth = {
    DAILY_MOOD_KEY: "dailyMoodRecord",
    getToken() { return ""; },
    hasPrivacyConsent() { return true; },
    getPersonalOwner() { return owner; },
    getPersonalData() { return null; },
    getMoodGuestId() { return "guest_page-test_1234"; },
    setPersonalData() { cacheWrites += 1; }
  };
  const runtime = {
    buildView(mood) { return { mood }; },
    getCycleDate() { return "2026-07-09"; },
    fetchToday() {
      return new Promise((resolve) => pending.push(resolve));
    }
  };
  const definition = loadHomePage(auth, runtime);
  const unloadedPage = createPage(definition);
  unloadedPage.refreshTodayMood();
  unloadedPage.onUnload();
  pending.shift()({ data: { mood: { mood_id: "late-unload" } }, owner: "anonymous" });
  await flushPromises();
  await flushPromises();

  const switchedPage = createPage(definition);
  owner = "anonymous";
  switchedPage.refreshTodayMood();
  owner = "user:new-owner";
  pending.shift()({ data: { mood: { mood_id: "late-owner" } }, owner: "anonymous" });
  await flushPromises();
  await flushPromises();

  assert.equal(cacheWrites, 0);
});
