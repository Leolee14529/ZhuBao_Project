const crypto = require("crypto");
const https = require("https");

const CODE2SESSION_ENDPOINT = "https://api.weixin.qq.com/sns/jscode2session";
const REQUEST_TIMEOUT_MS = 10000;

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
    const request = https.get(url, (response) => {
      let responseBody = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "WeChat code2session request failed"));
          return;
        }

        try {
          resolve(JSON.parse(responseBody));
        } catch (error) {
          reject(createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "WeChat code2session response is invalid"));
        }
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "WeChat code2session request timed out"));
    });

    request.on("error", (error) => {
      if (error.status && error.code) {
        reject(error);
        return;
      }
      reject(createServiceError(502, "WECHAT_CODE2SESSION_FAILED", "WeChat code2session request failed"));
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
  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_SECRET || process.env.WECHAT_APP_SECRET;

  if (!appid || !secret) {
    if (shouldUseMockLogin()) {
      return createMockSession(code);
    }

    throw createServiceError(500, "WECHAT_CONFIG_MISSING", "WeChat appid or secret is not configured");
  }

  const query = new URLSearchParams({
    appid,
    secret,
    js_code: code,
    grant_type: "authorization_code"
  });
  const response = await requestJson(`${CODE2SESSION_ENDPOINT}?${query.toString()}`);

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
