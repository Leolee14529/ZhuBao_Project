const express = require("express");
const {
  calculateWuxing,
  saveLatestResult,
  getLatestResult
} = require("../services/baziService");

const router = express.Router();

function requireFields(res, body, fields) {
  const missingFields = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");

  if (missingFields.length > 0) {
    res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`
    });
    return false;
  }

  return true;
}

router.post("/calculate", (req, res, next) => {
  try {
    if (!requireFields(res, req.body, ["birthDate", "birthTime", "gender"])) {
      return;
    }

    const result = calculateWuxing(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/save", (req, res, next) => {
  try {
    if (!requireFields(res, req.body, ["birthDate", "birthTime", "gender"])) {
      return;
    }

    const result = saveLatestResult(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/latest", (req, res, next) => {
  try {
    const userId = req.query.userId || "default";
    const result = getLatestResult(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
