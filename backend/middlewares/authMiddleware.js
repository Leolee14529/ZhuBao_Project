const sessionRepository = require("../repositories/sessionRepository");
const userRepository = require("../repositories/userRepository");
const { sendError } = require("../http/responses");

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

async function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req.get("authorization"));

    if (!token) {
      return sendError(
        res,
        401,
        "AUTH_TOKEN_REQUIRED",
        "Authorization token is required",
        req.requestId
      );
    }

    const session = await sessionRepository.findSessionByToken(token);
    if (!session) {
      return sendError(
        res,
        401,
        "AUTH_TOKEN_INVALID",
        "Authorization token is invalid",
        req.requestId
      );
    }

    if (sessionRepository.isSessionExpired(session)) {
      return sendError(
        res,
        401,
        "AUTH_TOKEN_EXPIRED",
        "Authorization token is expired",
        req.requestId
      );
    }

    const user = await userRepository.findUserById(session.userId);
    if (!user) {
      return sendError(
        res,
        401,
        "USER_NOT_FOUND",
        "User was not found",
        req.requestId
      );
    }

    req.user = user;
    req.session = session;
    req.authToken = token;
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth:user]", {
        path: req.originalUrl,
        userId: req.user.id
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authMiddleware;
