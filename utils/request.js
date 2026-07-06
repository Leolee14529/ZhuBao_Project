const config = require("./config");
const auth = require("./auth");

const DEFAULT_ERROR_MESSAGE = "请求失败，请稍后再试";
function createRequestError(message, code, statusCode, data) {
  const error = new Error(message || DEFAULT_ERROR_MESSAGE);
  error.code = code || "REQUEST_FAILED";
  error.statusCode = statusCode || 0;
  error.data = data || null;
  return error;
}

function normalizePath(path) {
  if (!path || typeof path !== "string") {
    throw createRequestError("请求路径不能为空", "REQUEST_PATH_REQUIRED", 0);
  }

  if (/^https?:\/\//i.test(path)) {
    throw createRequestError("请求路径必须使用相对路径", "REQUEST_PATH_INVALID", 0);
  }

  return path.charAt(0) === "/" ? path : "/" + path;
}

function getToken() {
  return auth.getToken();
}

function buildHeader(header) {
  const nextHeader = Object.assign({}, header || {});
  const token = getToken();

  if (!nextHeader["content-type"] && !nextHeader["Content-Type"]) {
    nextHeader["content-type"] = "application/json";
  }

  if (token && !nextHeader.Authorization && !nextHeader.authorization) {
    nextHeader.Authorization = "Bearer " + token;
  }

  return nextHeader;
}

function clearAuthState() {
  auth.clearAuthState();
}

function getCurrentPageUrl() {
  try {
    const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
    const currentPage = pages && pages.length ? pages[pages.length - 1] : null;
    return currentPage && currentPage.route ? "/" + currentPage.route : "";
  } catch (error) {
    return "";
  }
}

function redirectToLogin(source) {
  auth.redirectToLogin(source);
}

function request(options) {
  const requestOptions = options || {};

  return new Promise((resolve, reject) => {
    let path = "";
    let baseUrl = "";

    try {
      path = normalizePath(requestOptions.url || requestOptions.path);
      baseUrl = config.getApiBaseUrl();
      if (!baseUrl) {
        throw createRequestError(
          "当前版本尚未配置服务器地址",
          "API_BASE_URL_MISSING",
          0
        );
      }
    } catch (error) {
      reject(error);
      return;
    }

    wx.request({
      url: baseUrl + path,
      method: requestOptions.method || "GET",
      data: requestOptions.data || {},
      header: buildHeader(requestOptions.header),
      timeout: requestOptions.timeout || 12000,
      success(response) {
        const statusCode = response.statusCode || 0;
        const body = response.data || {};

        if (statusCode >= 200 && statusCode < 300 && body.success === true) {
          resolve(body.data || {});
          return;
        }

        const requestError = createRequestError(
          body.message || DEFAULT_ERROR_MESSAGE,
          body.code || "REQUEST_FAILED",
          statusCode,
          body
        );
        if (statusCode === 401 && path !== "/api/auth/wechat-login") {
          redirectToLogin(getCurrentPageUrl());
        }
        reject(requestError);
      },
      fail(error) {
        reject(createRequestError(
          error && error.errMsg ? error.errMsg : "网络请求失败，请稍后再试",
          "REQUEST_NETWORK_ERROR",
          0,
          error
        ));
      }
    });
  });
}

function get(path, data, header) {
  return request({
    url: path,
    method: "GET",
    data,
    header
  });
}

function post(path, data, header) {
  return request({
    url: path,
    method: "POST",
    data,
    header
  });
}

function del(path, data, header) {
  return request({
    url: path,
    method: "DELETE",
    data,
    header
  });
}

module.exports = {
  request,
  get,
  post,
  delete: del,
  clearAuthState,
  redirectToLogin
};
