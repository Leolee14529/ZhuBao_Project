const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const sleepRecordRepository = require("../repositories/sleepRecordRepository");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();

function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validationError(res, req, message) {
  sendError(res, 400, "VALIDATION_ERROR", message, req.requestId);
  return null;
}

function conflictError(res, req, message) {
  sendError(res, 409, "CONFLICT", message, req.requestId);
  return null;
}

router.use((req, res, next) => {
  req._sleepPerfStartedAt = Date.now();
  console.log("[perf:sleep-route]", {
    step: "incoming",
    method: req.method,
    url: req.originalUrl
  });
  next();
});

router.use((req, res, next) => {
  const authStartedAt = Date.now();
  return authMiddleware(req, res, (error) => {
    console.log("[perf:sleep-route]", {
      step: "auth-finished",
      method: req.method,
      url: req.originalUrl,
      authMs: Date.now() - authStartedAt,
      totalMs: Date.now() - (req._sleepPerfStartedAt || authStartedAt)
    });
    if (error) return next(error);
    return next();
  });
});

function parseRecord(req, res) {
  const body = req.body || {};
  const recordDate = body.recordDate;
  const sleepDurationMinutes = body.sleepDurationMinutes;
  const sleepHours = body.sleepHours;
  const sleepMinutes = body.sleepMinutes;

  if (!isDateKey(recordDate)) return validationError(res, req, "recordDate must be a valid YYYY-MM-DD date");
  if (!Number.isInteger(sleepDurationMinutes) || sleepDurationMinutes <= 0 || sleepDurationMinutes > 1440) {
    return validationError(res, req, "sleepDurationMinutes must be an integer between 1 and 1440");
  }
  if (!Number.isInteger(sleepHours) || sleepHours < 0 || sleepHours > 24) {
    return validationError(res, req, "sleepHours must be an integer between 0 and 24");
  }
  if (!Number.isInteger(sleepMinutes) || sleepMinutes < 0 || sleepMinutes > 59) {
    return validationError(res, req, "sleepMinutes must be an integer between 0 and 59");
  }
  if (sleepHours * 60 + sleepMinutes !== sleepDurationMinutes) {
    return validationError(res, req, "sleepDurationMinutes must equal sleepHours * 60 + sleepMinutes");
  }

  return { recordDate, sleepDurationMinutes, sleepHours, sleepMinutes };
}

function parseListFilters(req, res) {
  const from = req.query.from || "";
  const to = req.query.to || "";
  const rawLimit = req.query.limit === undefined ? 31 : Number(req.query.limit);
  if ((from && !isDateKey(from)) || (to && !isDateKey(to)) || (from && to && from > to)) {
    return validationError(res, req, "from and to must be an ordered YYYY-MM-DD range");
  }
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 90) {
    return validationError(res, req, "limit must be an integer between 1 and 90");
  }
  return { from, to, limit: rawLimit };
}

router.get("/", async (req, res, next) => {
  const routeStartedAt = Date.now();
  try {
    const filters = parseListFilters(req, res);
    if (!filters) return;
    const repositoryStartedAt = Date.now();
    const records = await sleepRecordRepository.list(req.user.id, filters);
    console.log("[perf:sleep-route]", {
      route: "GET /api/sleep-records",
      repositoryMs: Date.now() - repositoryStartedAt,
      totalMs: Date.now() - routeStartedAt,
      overallMs: Date.now() - (req._sleepPerfStartedAt || routeStartedAt),
      recordCount: Array.isArray(records) ? records.length : 0
    });
    return sendSuccess(res, { records });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const routeStartedAt = Date.now();
  try {
    const input = parseRecord(req, res);
    if (!input) return;
    const repositoryStartedAt = Date.now();
    const record = await sleepRecordRepository.create(req.user.id, input);
    console.log("[perf:sleep-route]", {
      route: "POST /api/sleep-records",
      repositoryMs: Date.now() - repositoryStartedAt,
      totalMs: Date.now() - routeStartedAt,
      overallMs: Date.now() - (req._sleepPerfStartedAt || routeStartedAt),
      recordId: record && record.id ? record.id : ""
    });
    return sendSuccess(res, { record });
  } catch (error) {
    if (error && error.code === "SLEEP_RECORD_EXISTS") return conflictError(res, req, "sleep record already exists");
    if (error && error.code === "23505") return conflictError(res, req, "sleep record already exists");
    return next(error);
  }
});

router.put("/:recordId", async (req, res, next) => {
  const routeStartedAt = Date.now();
  try {
    const recordId = req.params.recordId;
    if (typeof recordId !== "string" || !recordId) return validationError(res, req, "recordId is required");
    const input = parseRecord(req, res);
    if (!input) return;
    const repositoryStartedAt = Date.now();
    const record = await sleepRecordRepository.update(req.user.id, recordId, input);
    console.log("[perf:sleep-route]", {
      route: "PUT /api/sleep-records/:recordId",
      repositoryMs: Date.now() - repositoryStartedAt,
      totalMs: Date.now() - routeStartedAt,
      overallMs: Date.now() - (req._sleepPerfStartedAt || routeStartedAt),
      recordId
    });
    if (!record) return sendError(res, 404, "NOT_FOUND", "sleep record not found", req.requestId);
    return sendSuccess(res, { record });
  } catch (error) {
    if (error && error.code === "SLEEP_RECORD_EXISTS") return conflictError(res, req, "sleep record already exists");
    if (error && error.code === "23505") return conflictError(res, req, "sleep record already exists");
    return next(error);
  }
});

module.exports = router;
