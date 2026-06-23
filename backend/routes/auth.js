const express = require("express");
const wechatService = require("../services/wechatService");
const userStore = require("../services/userStore");
const sessionStore = require("../services/sessionStore");

const router = express.Router();

function sendSuccess(res, data) {
  return res.json({
    success: true,
    data
  });
}

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    message,
    code
  });
}

router.post("/wechat-login", async (req, res) => {
  try {
    const code = req.body && typeof req.body.code === "string" ? req.body.code.trim() : "";

    if (!code) {
      return sendError(res, 400, "AUTH_CODE_REQUIRED", "code is required");
    }

    const wechatSession = await wechatService.code2Session(code);
    const user = userStore.findOrCreateByWechatProfile({
      openid: wechatSession.openid,
      unionid: wechatSession.unionid
    });
    const session = sessionStore.createSession(user);

    return sendSuccess(res, {
      token: session.token,
      user
    });
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || "INTERNAL_ERROR";
    const message = error.code ? error.message : "Internal server error";

    console.error("wechat login failed", error);
    return sendError(res, status, code, message);
  }
});

module.exports = router;
