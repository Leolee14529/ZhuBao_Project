const express = require("express");
const { calculateWuxing } = require("../services/baziService");
const wuxingRepository = require("../repositories/wuxingRepository");
const authMiddleware = require("../middlewares/authMiddleware");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();

function requireFields(req, res, body, fields) {
  const missingFields = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");

  if (missingFields.length > 0) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      `Missing required fields: ${missingFields.join(", ")}`,
      req.requestId
    );
    return false;
  }

  return true;
}

router.use(authMiddleware);

router.post("/calculate", (req, res, next) => {
  try {
    if (!requireFields(req, res, req.body, ["birthDate", "birthTime", "gender"])) {
      return;
    }

    const result = calculateWuxing({
      ...req.body,
      userId: req.user.id
    });
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
});

router.post("/save", async (req, res, next) => {
  try {
    if (!requireFields(req, res, req.body, ["birthDate", "birthTime", "gender"])) {
      return;
    }

    const calculated = calculateWuxing({
      ...req.body,
      userId: req.user.id
    });
    const result = await wuxingRepository.saveLatestResult(
      req.user.id,
      req.body,
      calculated
    );
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
});

router.get("/latest", async (req, res, next) => {
  try {
    const result = await wuxingRepository.getLatestResult(req.user.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
});

router.delete("/profile", async (req, res, next) => {
  try {
    await wuxingRepository.deleteProfile(req.user.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
