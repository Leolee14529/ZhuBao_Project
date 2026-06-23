const config = require("./config");

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
  try {
    return wx.getStorageSync("token");
  } catch (error) {
    return "";
  }
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

function request(options) {
  const requestOptions = options || {};

  return new Promise((resolve, reject) => {
    let path = "";

    try {
      path = normalizePath(requestOptions.url || requestOptions.path);
    } catch (error) {
      reject(error);
      return;
    }

    wx.request({
      url: config.API_BASE_URL + path,
      method: requestOptions.method || "GET",
      data: requestOptions.data || {},
      header: buildHeader(requestOptions.header),
      success(response) {
        const statusCode = response.statusCode || 0;
        const body = response.data || {};

        if (statusCode >= 200 && statusCode < 300 && body.success === true) {
          resolve(body.data || {});
          return;
        }

        reject(createRequestError(
          body.message || DEFAULT_ERROR_MESSAGE,
          body.code || "REQUEST_FAILED",
          statusCode,
          body
        ));
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

module.exports = {
  request,
  get,
  post
};
