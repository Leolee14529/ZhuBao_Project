const { sendError } = require("../http/responses");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || (error.type === "entity.parse.failed" ? 400 : 500);
  const code = error.code || (status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR");
  const message = status >= 500 && !error.code ? "Internal server error" : error.message;

  console.error(JSON.stringify({
    level: "error",
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    code,
    message: error.message
  }));

  return sendError(res, status, code, message, req.requestId);
}

module.exports = errorHandler;
