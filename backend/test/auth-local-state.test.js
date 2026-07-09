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
