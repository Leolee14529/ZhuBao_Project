const express = require("express");
const moodService = require("../services/moodService");
const sessionRepository = require("../repositories/sessionRepository");
const userRepository = require("../repositories/userRepository");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();
const GUEST_ID_PATTERN = /^guest_[a-zA-Z0-9_.:-]{8,80}$/;

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") return "";

  const parts = authorizationHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return "";
  return parts[1];
}

function getGuestId(req) {
  const guestId = req.get("x-guest-id") || "";
  return GUEST_ID_PATTERN.test(guestId) ? guestId : "";
}

async function resolveMoodOwner(req, res, next) {
  try {
    const token = getBearerToken(req.get("authorization"));
    if (!token) {
      const guestId = getGuestId(req);
      if (!guestId) {
        return sendError(res, 400, "MOOD_OWNER_REQUIRED", "Guest id is required", req.requestId);
      }
      req.moodOwnerId = guestId;
      return next();
    }

    const session = await sessionRepository.findSessionByToken(token);
    if (!session || sessionRepository.isSessionExpired(session)) {
      return sendError(res, 401, "AUTH_TOKEN_INVALID", "Authorization token is invalid", req.requestId);
    }

    const user = await userRepository.findUserById(session.userId);
    if (!user) {
      return sendError(res, 401, "USER_NOT_FOUND", "User was not found", req.requestId);
    }

    req.moodOwnerId = user.id;
    return next();
  } catch (error) {
    return next(error);
  }
}

router.get("/today", resolveMoodOwner, async (req, res, next) => {
  try {
    const mood = await moodService.getTodayMood(req.moodOwnerId);
    return sendSuccess(res, { code: 0, mood });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
