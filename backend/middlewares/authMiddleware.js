const sessionStore = require("../services/sessionStore");
const userStore = require("../services/userStore");

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    message,
    code
  });
}

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return "";
  }

  const parts = authorizationHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return "";
  }

  return parts[1];
}

function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req.get("authorization"));

    if (!token) {
      return sendError(res, 401, "AUTH_TOKEN_REQUIRED", "Authorization token is required");
    }

    const session = sessionStore.findSessionByToken(token);
    if (!session) {
      return sendError(res, 401, "AUTH_TOKEN_INVALID", "Authorization token is invalid");
    }

    if (sessionStore.isSessionExpired(session)) {
      return sendError(res, 401, "AUTH_TOKEN_EXPIRED", "Authorization token is expired");
    }

    const user = userStore.findUserById(session.userId);
    if (!user) {
      return sendError(res, 401, "USER_NOT_FOUND", "User was not found");
    }

    req.user = user;
    req.session = session;
    return next();
  } catch (error) {
    console.error("auth middleware failed", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
  }
}

module.exports = authMiddleware;
