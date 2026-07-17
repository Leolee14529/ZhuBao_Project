const assert = require("node:assert/strict");
const test = require("node:test");

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

test("personal local data is scoped to the authenticated user", () => {
  const storage = {};
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-a", { id: "a" });
  auth.setPersonalData(auth.WUXING_KEY, { owner: "a" });
  auth.acceptAuthenticatedSession("token-b", { id: "b" });

  assert.equal(auth.getPersonalData(auth.WUXING_KEY), undefined);
  auth.setPersonalData(auth.WUXING_KEY, { owner: "b" });
  auth.acceptAuthenticatedSession("token-a2", { id: "a" });

  assert.deepEqual(auth.getPersonalData(auth.WUXING_KEY), { owner: "a" });
});

test("auth transitions remove legacy global personal keys", () => {
  const storage = { jewelryWuxingResult: { legacy: true } };
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-c", { id: "c" });

  assert.equal(storage.jewelryWuxingResult, undefined);
});

test("entering guest mode clears current account personal data", () => {
  const storage = {};
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-d", { id: "d" });
  auth.setPersonalData(auth.CYCLE_KEY, { cycleLength: "28" });
  auth.enterGuestMode();

  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.equal(storage.guestMode, true);
  assert.equal(storage["periodCalendarCycleProfile:user:d"], undefined);
});

test("expired sessions redirect to login without deleting current account cycle data", () => {
  const storage = {};
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-e", { id: "e" });
  auth.setPersonalData(auth.CYCLE_KEY, { cycleLength: "29" });
  auth.redirectToLogin("/subpackage/jewelry/pages/data/index");

  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.deepEqual(storage["periodCalendarCycleProfile:user:e"], { cycleLength: "29" });
});

test("request logout cleanup removes only the session and preserves personal data", () => {
  const storage = {};
  const auth = loadAuth(storage);

  auth.acceptAuthenticatedSession("token-f", { id: "f" });
  auth.setPersonalData(auth.CYCLE_KEY, { cycleLength: "30" });
  delete require.cache[require.resolve("../../utils/request")];
  const request = require("../../utils/request");
  request.clearAuthState();

  assert.equal(storage.token, undefined);
  assert.equal(storage.userInfo, undefined);
  assert.deepEqual(storage["periodCalendarCycleProfile:user:f"], { cycleLength: "30" });
});

test("sleep detail remains a safe login restore target", () => {
  const storage = {};
  const launches = [];
  const auth = loadAuth(storage);
  global.wx.reLaunch = (options) => launches.push(options.url);

  auth.redirectToLogin("/subpackage/jewelry/pages/sleep-detail/index");

  assert.deepEqual(launches, [
    "/pages/login/index?redirect=%2Fsubpackage%2Fjewelry%2Fpages%2Fsleep-detail%2Findex"
  ]);
});
