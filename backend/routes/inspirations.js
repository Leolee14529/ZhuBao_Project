const express = require("express");
const inspirationService = require("../services/inspirationService");
const { sendSuccess } = require("../http/responses");

const router = express.Router();

router.get("/random", (req, res, next) => {
  try {
    const previousId = typeof req.query.previousId === "string"
      ? req.query.previousId
      : "";
    return sendSuccess(res, {
      inspiration: inspirationService.getRandomInspiration({ previousId })
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
