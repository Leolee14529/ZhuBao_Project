const crypto = require("crypto");

function requestContext(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.get("x-request-id") || crypto.randomUUID();
  req.requestId = requestId;
  res.set("x-request-id", requestId);

  res.on("finish", () => {
    if (process.env.NODE_ENV !== "production") return;
    console.log(JSON.stringify({
      level: "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt
    }));
  });
  next();
}

module.exports = requestContext;
