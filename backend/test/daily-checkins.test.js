const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-checkin-test-"));
process.env.NODE_ENV = "test";
process.env.WECHAT_MOCK_LOGIN = "true";
process.env.ZHUBAO_DATA_DIR = runtimeDir;
delete process.env.DATABASE_URL;

const createApp = require("../app");

let server;
let baseUrl;

test.before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  fs.rmSync(runtimeDir, { recursive: true, force: true });
});

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, body: await response.json() };
}

async function login(code) {
  const result = await request("/api/auth/wechat-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code })
  });
  assert.equal(result.response.status, 200);
  return result.body.data;
}

function buildInput(overrides = {}) {
  return {
    checkinDate: "2026-07-12",
    mood: 4,
    energy: 3,
    sleepMinutes: 450,
    isWearingJewelry: true,
    tags: ["专注", "放松"],
    note: "下班后散步，状态平稳。",
    ...overrides
  };
}

test("daily check-ins validate input, upsert by date, and stay private to their owner", async () => {
  const alice = await login("checkin-alice");
  const bob = await login("checkin-bob");
  const aliceHeaders = {
    "content-type": "application/json",
    authorization: `Bearer ${alice.token}`
  };
  const bobHeaders = { authorization: `Bearer ${bob.token}` };

  const invalid = await request("/api/daily-checkins", {
    method: "POST",
    headers: aliceHeaders,
    body: JSON.stringify(buildInput({ mood: 6 }))
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.code, "VALIDATION_ERROR");

  const created = await request("/api/daily-checkins", {
    method: "POST",
    headers: aliceHeaders,
    body: JSON.stringify(buildInput({ userId: "attacker-controlled-id" }))
  });
  assert.equal(created.response.status, 200);
  assert.equal(created.body.data.checkin.checkinDate, "2026-07-12");
  assert.equal(created.body.data.checkin.mood, 4);
  assert.equal(created.body.data.checkin.userId, undefined);

  const updated = await request("/api/daily-checkins", {
    method: "POST",
    headers: aliceHeaders,
    body: JSON.stringify(buildInput({ energy: 5, note: "更新后的记录。" }))
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.checkin.energy, 5);

  const aliceList = await request("/api/daily-checkins?from=2026-07-06&to=2026-07-12", {
    headers: bobHeaders
  });
  assert.equal(aliceList.response.status, 200);
  assert.deepEqual(aliceList.body.data.checkins, []);

  const ownList = await request("/api/daily-checkins?from=2026-07-06&to=2026-07-12", {
    headers: aliceHeaders
  });
  assert.equal(ownList.response.status, 200);
  assert.equal(ownList.body.data.checkins.length, 1);
  assert.equal(ownList.body.data.checkins[0].energy, 5);

  const removed = await request("/api/daily-checkins/2026-07-12", {
    method: "DELETE",
    headers: aliceHeaders
  });
  assert.equal(removed.response.status, 200);
  assert.equal(removed.body.data.deleted, true);
  assert.equal(removed.body.data.checkin.checkinDate, "2026-07-12");
});
