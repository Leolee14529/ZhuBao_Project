const express = require("express");
const wechatService = require("../services/wechatService");
const passwordService = require("../services/passwordService");
const userRepository = require("../repositories/userRepository");
const sessionRepository = require("../repositories/sessionRepository");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();

router.post("/wechat-login", async (req, res, next) => {
  const startedAt = Date.now();
  try {
    const code = req.body && typeof req.body.code === "string" ? req.body.code.trim() : "";

    console.log("[wechat-login:incoming]", {
      time: Date.now(),
      hasCode: Boolean(code)
    });
    console.log("[wechat-login:start]", {
      hasCode: Boolean(code)
    });

    if (!code) {
      return sendError(res, 400, "AUTH_CODE_REQUIRED", "code is required", req.requestId);
    }

    console.log("[wechat-login:code2session:start]", { time: Date.now() });
    const wechatSession = await wechatService.code2Session(code);
    console.log("[wechat-login:code2session:success]", {
      durationMs: Date.now() - startedAt,
      hasOpenid: Boolean(wechatSession && wechatSession.openid)
    });

    console.log("[wechat-login:user:start]", { time: Date.now() });
    const user = await userRepository.findOrCreateByWechatProfile({
      openid: wechatSession.openid,
      unionid: wechatSession.unionid
    });
    console.log("[wechat-login:user:success]", {
      durationMs: Date.now() - startedAt,
      userId: user && user.id
    });

    const session = await sessionRepository.createSession(user);
    console.log("[wechat-login:response]", {
      durationMs: Date.now() - startedAt,
      userId: user && user.id
    });
    console.log("[wechat-login:total]", {
      durationMs: Date.now() - startedAt,
      status: 200
    });

    return sendSuccess(res, {
      token: session.token,
      user: userRepository.toClientUser(user)
    });
  } catch (error) {
    console.error("[wechat-login:error]", {
      durationMs: Date.now() - startedAt,
      status: error.status,
      code: error.code,
      message: error.message
    });
    console.log("[wechat-login:total]", {
      durationMs: Date.now() - startedAt,
      status: error.status || 502
    });
    return sendError(
      res,
      error.status || 502,
      error.code || "WECHAT_LOGIN_FAILED",
      error.message || "微信登录暂时不可用，请稍后再试",
      req.requestId
    );
  }
});

router.post("/account-register", async (req, res, next) => {
  try {
    const accountName = passwordService.validateAccountName(req.body && req.body.accountName);
    const password = passwordService.validatePassword(req.body && req.body.password);
    const existing = await userRepository.findUserByAccountName(accountName);

    if (existing) {
      return sendError(res, 409, "ACCOUNT_EXISTS", "账号已存在", req.requestId);
    }

    const passwordHash = await passwordService.hashPassword(password);
    const user = await userRepository.createAccountUser(accountName, passwordHash);
    if (!user) {
      return sendError(res, 409, "ACCOUNT_EXISTS", "账号已存在", req.requestId);
    }
    const session = await sessionRepository.createSession(user);

    return sendSuccess(res, {
      token: session.token,
      user: userRepository.toClientUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/account-login", async (req, res, next) => {
  try {
    const accountName = passwordService.validateAccountName(req.body && req.body.accountName);
    const inputPassword = req.body && req.body.password;
    const passwordShapeValid = passwordService.isValidPasswordInput(inputPassword);
    const password = passwordShapeValid ? inputPassword : "InvalidPass0rd";
    const user = await userRepository.findUserByAccountName(accountName);
    const storedHash = user && user.passwordHash ?
      user.passwordHash :
      await passwordService.getDummyPasswordHash();
    const passwordMatches = await passwordService.verifyPassword(password, storedHash);
    const isValid = !!user && passwordShapeValid && passwordMatches;

    if (!isValid) {
      return sendError(res, 401, "ACCOUNT_LOGIN_FAILED", "账号或密码错误", req.requestId);
    }

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
