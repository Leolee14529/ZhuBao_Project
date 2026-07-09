const crypto = require("node:crypto");

const DEFAULT_BASE_URL = "https://jewelry-api.birdai-glasses.com";
const baseUrl = String(
  process.env.ZHUBAO_API_BASE_URL ||
  process.env.API_BASE_URL ||
  DEFAULT_BASE_URL
).replace(/\/+$/, "");

const password = process.env.ZHUBAO_SMOKE_PASSWORD || "SmokePass2026!";
const accountName = process.env.ZHUBAO_SMOKE_ACCOUNT ||
  `smoke_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

function fail(message) {
  console.error(`[smoke] FAIL ${message}`);
  process.exitCode = 1;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : {};
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function assertSuccess(result, label) {
  if (!result.body || result.body.success !== true) {
    throw new Error(`${label} failed with status ${result.response.status}: ${JSON.stringify(result.body)}`);
  }
}

function assertStatus(result, status, label) {
  if (result.response.status !== status) {
    throw new Error(`${label} expected ${status}, got ${result.response.status}: ${JSON.stringify(result.body)}`);
  }
}

async function main() {
  console.log(`[smoke] target ${baseUrl}`);
  let cleanupToken = "";

  try {
    const ready = await request("/health/ready");
    assertSuccess(ready, "health ready");
    if (!ready.body.data.database || ready.body.data.database.healthy !== true) {
      throw new Error("database is not healthy");
    }

    assertStatus(await request("/api/auth/wechat-login", {
      method: "POST",
      body: JSON.stringify({})
    }), 400, "wechat auth route");
    assertStatus(await request("/api/auth/logout", { method: "POST" }), 401, "logout route auth guard");
    assertStatus(await request("/api/wuxing/latest"), 401, "wuxing auth guard");
    assertSuccess(await request("/api/inspirations/random"), "inspiration random");

    const register = await request("/api/auth/account-register", {
      method: "POST",
      body: JSON.stringify({ accountName, password })
    });
    assertSuccess(register, "account register");
    const registered = register.body.data;
    cleanupToken = registered.token;
    if (!registered.token || !registered.user || !registered.user.id) {
      throw new Error("register response is missing token or user");
    }
    if (registered.user.passwordHash || registered.user.openid) {
      throw new Error("register response leaked private account fields");
    }

    const login = await request("/api/auth/account-login", {
      method: "POST",
      body: JSON.stringify({ accountName: accountName.toUpperCase(), password })
    });
    assertSuccess(login, "account login");
    const signedIn = login.body.data;
    cleanupToken = signedIn.token;
    if (!signedIn.token || signedIn.user.id !== registered.user.id) {
      throw new Error("login response does not match registered user");
    }

    const me = await request("/api/users/me", {
      headers: { authorization: `Bearer ${signedIn.token}` }
    });
    assertSuccess(me, "current user");
    if (!me.body.data.user || me.body.data.user.id !== registered.user.id) {
      throw new Error("current user does not match login session");
    }

    const deleted = await request("/api/users/me", {
      method: "DELETE",
      headers: { authorization: `Bearer ${signedIn.token}` }
    });
    assertSuccess(deleted, "delete smoke account");
    cleanupToken = "";
    console.log(`[smoke] PASS account auth flow for ${accountName}`);
  } finally {
    if (cleanupToken) {
      const cleanup = await request("/api/users/me", {
        method: "DELETE",
        headers: { authorization: `Bearer ${cleanupToken}` }
      });
      if (cleanup.response.status >= 300) {
        console.error(`[smoke] cleanup failed: ${cleanup.response.status} ${JSON.stringify(cleanup.body)}`);
      }
    }
  }
}

main().catch((error) => {
  fail(error && error.message ? error.message : String(error));
});
