const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-auth-sec-test-"));
process.env.NODE_ENV = "test";
process.env.WECHAT_MOCK_LOGIN = "true";
process.env.ZHUBAO_DATA_DIR = runtimeDir;
delete process.env.DATABASE_URL;

const createApp = require("../app");
const errorHandler = require("../middlewares/errorHandler");

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

async function register(accountName, password) {
  const result = await request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName, password })
  });
  assert.equal(result.response.status, 200);
  return result.body.data;
}

test("account register rejects weak or malformed passwords", async () => {
  const weak = await request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName: "weak-user", password: "aaaaaaaa" })
  });
  assert.equal(weak.response.status, 400);
  assert.equal(weak.body.code, "PASSWORD_INVALID");

  const objectPassword = await request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName: "object-user", password: { value: "Passw0rd!2026" } })
  });
  assert.equal(objectPassword.response.status, 400);
  assert.equal(objectPassword.body.code, "PASSWORD_INVALID");
});

test("concurrent account register leaves only one account", async () => {
  const attempts = await Promise.all([0, 1, 2, 3].map(() => request("/api/auth/account-register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accountName: "race-user", password: "Passw0rd!2026" })
  })));
  const successCount = attempts.filter((item) => item.response.status === 200).length;
  const conflictCount = attempts.filter((item) => item.response.status === 409).length;
  assert.equal(successCount, 1);
  assert.equal(conflictCount, 3);
});

test("account deletion removes JSON wuxing data", async () => {
  const auth = await register("delete-wuxing-user", "Passw0rd!2026");
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${auth.token}`
  };
  await request("/api/wuxing/save", {
    method: "POST",
    headers,
    body: JSON.stringify({ birthDate: "2000-01-02", birthTime: "03:04", gender: "female" })
  });
  const deleted = await request("/api/users/me", {
    method: "DELETE",
    headers: { authorization: `Bearer ${auth.token}` }
  });
  assert.equal(deleted.response.status, 200);
  const wuxingFile = path.join(runtimeDir, "wuxing.json");
  const stored = JSON.parse(fs.readFileSync(wuxingFile, "utf8"));
  assert.equal(stored.users[auth.user.id], undefined);
});

test("server errors do not expose database codes or messages", () => {
  const captured = {};
  const errorLogs = [];
  const originalConsoleError = console.error;
  const res = {
    headersSent: false,
    status(statusCode) {
      captured.status = statusCode;
      return this;
    },
    json(body) {
      captured.body = body;
      return body;
    }
  };

  try {
    console.error = (line) => errorLogs.push(String(line));
    errorHandler(
      { status: 500, code: "23505", message: "duplicate key value violates unique constraint users_openid_key" },
      { requestId: "req-test", method: "POST", originalUrl: "/api/auth/wechat-login" },
      res,
      () => null
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(captured.status, 500);
  assert.equal(captured.body.code, "INTERNAL_ERROR");
  assert.equal(captured.body.message, "Internal server error");
  assert.doesNotMatch(errorLogs.join("\n"), /23505|duplicate key|openid/i);
  assert.match(errorLogs.join("\n"), /INTERNAL_ERROR/);
});
