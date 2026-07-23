const { sendError } = require("../http/responses");

function notFound(req, res) {
  return sendError(res, 404, "ROUTE_NOT_FOUND", "Route was not found", req.requestId);
}

module.exports = notFound;
