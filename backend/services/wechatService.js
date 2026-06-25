const https = require("https");

const CODE2SESSION_ENDPOINT = "https://api.weixin.qq.com/sns/jscode2session";
const REQUEST_TIMEOUT_MS = 10000;

function createServiceError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
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

async function code2Session(code) {
  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_SECRET || process.env.WECHAT_APP_SECRET;

  if (!appid || !secret) {
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
    throw createServiceError(502, "WECHAT_CODE2SESSION_FAILED", response.errmsg || "WeChat code2session failed");
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
