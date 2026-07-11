const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const userRepository = require("../repositories/userRepository");
const sessionRepository = require("../repositories/sessionRepository");
const wuxingRepository = require("../repositories/wuxingRepository");
const moodRepository = require("../repositories/moodRepository");
const { sendSuccess } = require("../http/responses");

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  return sendSuccess(res, {
    user: userRepository.toClientUser(req.user)
  });
});

router.delete("/me", authMiddleware, async (req, res, next) => {
  try {
    await wuxingRepository.deleteProfile(req.user.id);
    await moodRepository.deleteOwnerMood(req.user.id);
    await sessionRepository.revokeSessionsByUserId(req.user.id);
    await userRepository.deleteUserById(req.user.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
