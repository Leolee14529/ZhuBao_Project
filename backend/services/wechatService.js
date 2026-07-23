const crypto = require("crypto");
const https = require("https");

const CODE2SESSION_ENDPOINT = "https://api.weixin.qq.com/sns/jscode2session";
const REQUEST_TIMEOUT_MS = 8000;

function createServiceError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function mapWechatError(response) {
  const errcode = Number(response.errcode);
  if (errcode === 40029 || errcode === 40163) {
    return createServiceError(401, "WECHAT_CODE_INVALID", "登录凭证已失效，请重新登录");
  }
  if (errcode === 45011 || errcode === 40226) {
    return createServiceError(429, "WECHAT_LOGIN_LIMITED", "登录请求过于频繁，请稍后再试");
  }
  if (errcode === -1) {
    return createServiceError(502, "WECHAT_SERVICE_BUSY", "微信登录服务暂时不可用，请稍后再试");
  }
  return createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "微信登录暂时不可用，请稍后再试");
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(overallTimer);
      callback(value);
    };
    const resolveOnce = finish(resolve);
    const rejectOnce = finish(reject);
    const overallTimer = setTimeout(() => {
      rejectOnce(createServiceError(503, "WECHAT_SERVICE_UNAVAILABLE", "微信登录服务暂时不可用，请稍后再试"));
    }, REQUEST_TIMEOUT_MS);

    const request = https.get(url, (response) => {
      let responseBody = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          rejectOnce(createServiceError(503, "WECHAT_SERVICE_UNAVAILABLE", "微信登录服务暂时不可用，请稍后再试"));
          return;
        }

        try {
          resolveOnce(JSON.parse(responseBody));
        } catch (error) {
          rejectOnce(createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "微信登录服务返回内容无效"));
        }
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(createServiceError(503, "WECHAT_SERVICE_UNAVAILABLE", "微信登录服务暂时不可用，请稍后再试"));
    });

    request.on("error", (error) => {
      if (error.status && error.code) {
        rejectOnce(error);
        return;
      }
      rejectOnce(createServiceError(503, "WECHAT_SERVICE_UNAVAILABLE", "微信登录服务暂时不可用，请稍后再试"));
    });
  });
}

function shouldUseMockLogin() {
  return process.env.NODE_ENV !== "production" && process.env.WECHAT_MOCK_LOGIN !== "false";
}

function createMockSession(code) {
  const digest = crypto.createHash("sha256").update(code).digest("hex").slice(0, 24);

  console.warn("Using local mock WeChat login. Configure WECHAT_APPID and WECHAT_SECRET for real code2session.");

  return {
    openid: `mock_openid_${digest}`,
    unionid: null,
    sessionKey: null
  };
}

async function code2Session(code) {
  const startedAt = Date.now();
  const appid = process.env.WECHAT_APP_ID || process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_APP_SECRET || process.env.WECHAT_SECRET;

  console.log("[wechat-config]", {
    hasAppId: Boolean(appid),
    hasAppSecret: Boolean(secret)
  });

  if (!appid || !secret) {
    if (shouldUseMockLogin()) {
      const session = createMockSession(code);
      console.log("[wechat-login:code2session:success]", {
        mock: true,
        durationMs: Date.now() - startedAt
      });
      return session;
    }

    throw createServiceError(500, "WECHAT_CONFIG_MISSING", "WeChat appid or secret is not configured");
  }

  const query = new URLSearchParams({
    appid,
    secret,
    js_code: code,
    grant_type: "authorization_code"
  });
  console.log("[wechat-login:code2session:start]", {
    durationMs: Date.now() - startedAt,
    timeoutMs: REQUEST_TIMEOUT_MS
  });

  let response;
  try {
    response = await requestJson(`${CODE2SESSION_ENDPOINT}?${query.toString()}`);
  } catch (error) {
    console.error("[wechat-login:code2session:error]", {
      durationMs: Date.now() - startedAt,
      code: error.code,
      status: error.status,
      message: error.message
    });
    if (error.code === "WECHAT_CODE2SESSION_FAILED") {
      error.status = error.status || 503;
      error.code = "WECHAT_SERVICE_UNAVAILABLE";
      error.message = "微信登录服务暂时不可用，请稍后再试";
    }
    throw error;
  }

  console.log("[wechat-login:code2session:success]", {
    mock: false,
    durationMs: Date.now() - startedAt
  });

  if (response.errcode) {
    throw mapWechatError(response);
  }

  if (!response.openid) {
    throw createServiceError(502, "WECHAT_OPENID_MISSING", "WeChat code2session response missing openid");
  }

  return {
    openid: response.openid,
    unionid: response.unionid || null,
    sessionKey: response.session_key || null
  };
}

module.exports = {
  code2Session
};
