const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-api-test-"));
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

async function login(code) {
  const result = await request("/api/auth/wechat-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code })
  });
  assert.equal(result.response.status, 200);
  return result.body.data;
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

test("health endpoints return a unified response", async () => {
  const { response, body } = await request("/health/ready");
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "ready");
});

test("protected endpoints reject missing tokens", async () => {
  const { response, body } = await request("/api/wuxing/latest");
  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.code, "AUTH_TOKEN_REQUIRED");
});

test("random fortune endpoint returns a fortune card payload", async () => {
  const { response, body } = await request("/api/fortunes/random");
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.fortune.id);
  assert.ok(body.data.fortune.no);
  assert.ok(body.data.fortune.symbol);
  assert.ok(body.data.fortune.text);
});

test("authenticated user owns calculated and saved results", async () => {
  const auth = await login("api-test-owner");
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${auth.token}`
  };
  const input = {
    userId: "attacker-controlled-id",
    birthDate: "2000-01-02",
    birthTime: "03:04",
    gender: "female"
  };

  const calculated = await request("/api/wuxing/calculate", {
    method: "POST",
    headers,
    body: JSON.stringify(input)
  });
  assert.equal(calculated.response.status, 200);
  assert.equal(calculated.body.data.userId, auth.user.id);

  const saved = await request("/api/wuxing/save", {
    method: "POST",
    headers,
    body: JSON.stringify(input)
  });
  assert.equal(saved.response.status, 200);
  assert.equal(saved.body.data.userId, auth.user.id);

  const latest = await request("/api/wuxing/latest?userId=attacker-controlled-id", {
    headers
  });
  assert.equal(latest.response.status, 200);
  assert.equal(latest.body.data.userId, auth.user.id);
});

test("wechat login and current user responses are sanitized", async () => {
  const auth = await login("api-test-sanitized");
  assert.equal(auth.user.openid, undefined);
  assert.equal(auth.user.unionid, undefined);
  assert.equal(auth.user.sessionKey, undefined);

  const me = await request("/api/users/me", {
    headers: { authorization: `Bearer ${auth.token}` }
  });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.data.user.openid, undefined);
  assert.equal(me.body.data.user.unionid, undefined);
  assert.equal(me.body.data.user.sessionKey, undefined);
});

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

test("wuxing profile deletion is idempotent", async () => {
  const auth = await login("api-test-delete-wuxing");
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${auth.token}`
  };
  const input = {
    birthDate: "2001-02-03",
    birthTime: "04:05",
    gender: "male"
  };

  const saved = await request("/api/wuxing/save", {
    method: "POST",
    headers,
    body: JSON.stringify(input)
  });
  assert.equal(saved.response.status, 200);

  const deleted = await request("/api/wuxing/profile", {
    method: "DELETE",
    headers
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.body.data.deleted, true);

  const deletedAgain = await request("/api/wuxing/profile", {
    method: "DELETE",
    headers
  });
  assert.equal(deletedAgain.response.status, 200);

  const latest = await request("/api/wuxing/latest", { headers });
  assert.equal(latest.response.status, 404);
  assert.equal(latest.body.code, "WUXING_RESULT_NOT_FOUND");
});

test("account deletion revokes all sessions for the user", async () => {
  const first = await login("api-test-delete-account");
  const second = await login("api-test-delete-account");

  const deleted = await request("/api/users/me", {
    method: "DELETE",
    headers: { authorization: `Bearer ${first.token}` }
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.body.data.deleted, true);

  const firstMe = await request("/api/users/me", {
    headers: { authorization: `Bearer ${first.token}` }
  });
  assert.equal(firstMe.response.status, 401);

  const secondMe = await request("/api/users/me", {
    headers: { authorization: `Bearer ${second.token}` }
  });
  assert.equal(secondMe.response.status, 401);
});

test("logout revokes the current session", async () => {
  const auth = await login("api-test-logout");
  const headers = { authorization: `Bearer ${auth.token}` };

  const logout = await request("/api/auth/logout", {
    method: "POST",
    headers
  });
  assert.equal(logout.response.status, 200);
  assert.equal(logout.body.data.loggedOut, true);

  const me = await request("/api/users/me", { headers });
  assert.equal(me.response.status, 401);
  assert.equal(me.body.code, "AUTH_TOKEN_INVALID");
});

test("404 errors use JSON and include a request id", async () => {
  const { response, body } = await request("/api/not-found");
  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.code, "ROUTE_NOT_FOUND");
  assert.ok(body.requestId);
});
