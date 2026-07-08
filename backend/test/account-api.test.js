const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-account-api-test-"));
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
  const body = await response.json();
  return { response, body };
}

async function registerAccount(accountName, password) {
  const result = await request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName, password })
  });
  assert.equal(result.response.status, 200);
  return result.body.data;
}

async function loginAccount(accountName, password) {
  const result = await request("/api/auth/account-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName, password })
  });
  assert.equal(result.response.status, 200);
  return result.body.data;
}

test("account password register and login use the shared session flow", async () => {
  const created = await registerAccount("release_user@example.com", "Passw0rd!2026");
  assert.ok(created.token);
  assert.equal(created.user.passwordHash, undefined);
  assert.equal(created.user.openid, undefined);
  assert.equal(created.user.nickname, null);

  const me = await request("/api/users/me", {
    headers: { authorization: `Bearer ${created.token}` }
  });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.data.user.id, created.user.id);

  const signedIn = await loginAccount("RELEASE_USER@example.com", "Passw0rd!2026");
  assert.ok(signedIn.token);
  assert.equal(signedIn.user.id, created.user.id);

  const usersFile = path.join(runtimeDir, "users.json");
  const stored = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  const user = stored.users.find((item) => item.accountName === "release_user@example.com");
  assert.ok(user.passwordHash.startsWith("scrypt$"));
  assert.equal(user.passwordHash.includes("Passw0rd!2026"), false);
});

test("account password auth rejects duplicate names and bad passwords", async () => {
  await registerAccount("duplicate-user", "Passw0rd!2026");

  const duplicate = await request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      accountName: "duplicate-user",
      password: "Passw0rd!2026"
    })
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.code, "ACCOUNT_EXISTS");

  const wrongPassword = await request("/api/auth/account-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      accountName: "duplicate-user",
      password: "WrongPass!2026"
    })
  });
  assert.equal(wrongPassword.response.status, 401);
  assert.equal(wrongPassword.body.code, "ACCOUNT_LOGIN_FAILED");
});
