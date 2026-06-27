const express = require("express");
const wechatService = require("../services/wechatService");
const userRepository = require("../repositories/userRepository");
const sessionRepository = require("../repositories/sessionRepository");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();

router.post("/wechat-login", async (req, res, next) => {
  try {
    const code = req.body && typeof req.body.code === "string" ? req.body.code.trim() : "";

    if (!code) {
      return sendError(res, 400, "AUTH_CODE_REQUIRED", "code is required", req.requestId);
    }

    const wechatSession = await wechatService.code2Session(code);
    const user = await userRepository.findOrCreateByWechatProfile({
      openid: wechatSession.openid,
      unionid: wechatSession.unionid
    });
    const session = await sessionRepository.createSession(user);

    return sendSuccess(res, {
      token: session.token,
      user: userRepository.toClientUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    await sessionRepository.revokeSessionByToken(req.authToken);
    return sendSuccess(res, { loggedOut: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
