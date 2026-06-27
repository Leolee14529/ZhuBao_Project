const express = require("express");
const fortuneService = require("../services/fortuneService");
const { sendSuccess } = require("../http/responses");

const router = express.Router();

router.get("/random", (req, res, next) => {
  try {
    const previousId = typeof req.query.previousId === "string"
      ? req.query.previousId
      : "";
    return sendSuccess(res, {
      fortune: fortuneService.getRandomFortune({ previousId })
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
