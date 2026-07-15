const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const dailyCheckinRepository = require("../repositories/dailyCheckinRepository");
const { sendSuccess, sendError } = require("../http/responses");

const router = express.Router();
const ALLOWED_TAGS = new Set(["专注", "放松", "社交", "疲惫", "平静"]);

function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validationError(res, req, message) {
  sendError(res, 400, "VALIDATION_ERROR", message, req.requestId);
  return null;
}

function parseCheckin(req, res) {
  const body = req.body || {};
  const checkinDate = body.checkinDate;
  const mood = body.mood;
  const energy = body.energy;
  const sleepMinutes = body.sleepMinutes;
  const isWearingJewelry = body.isWearingJewelry;
  const tags = body.tags === undefined ? [] : body.tags;
  const note = body.note === undefined ? "" : body.note;

  if (!isDateKey(checkinDate)) return validationError(res, req, "checkinDate must be a valid YYYY-MM-DD date");
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) return validationError(res, req, "mood must be an integer between 1 and 5");
  if (!Number.isInteger(energy) || energy < 1 || energy > 5) return validationError(res, req, "energy must be an integer between 1 and 5");
  if (!Number.isInteger(sleepMinutes) || sleepMinutes < 0 || sleepMinutes > 1440) return validationError(res, req, "sleepMinutes must be an integer between 0 and 1440");
  if (typeof isWearingJewelry !== "boolean") return validationError(res, req, "isWearingJewelry must be a boolean");
  if (!Array.isArray(tags) || tags.length > 5 || tags.some((tag) => !ALLOWED_TAGS.has(tag))) {
    return validationError(res, req, "tags contain an unsupported value");
  }
  if (typeof note !== "string" || note.trim().length > 200) return validationError(res, req, "note must be at most 200 characters");

  return {
    checkinDate,
    mood,
    energy,
    sleepMinutes,
    isWearingJewelry,
    tags,
    note: note.trim()
  };
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

router.use(authMiddleware);

router.post("/", async (req, res, next) => {
  try {
    const input = parseCheckin(req, res);
    if (!input) return;
    const checkin = await dailyCheckinRepository.upsert(req.user.id, input);
    return sendSuccess(res, { checkin });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const filters = parseListFilters(req, res);
    if (!filters) return;
    const checkins = await dailyCheckinRepository.list(req.user.id, filters);
    return sendSuccess(res, { checkins });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:checkinDate", async (req, res, next) => {
  try {
    const checkinDate = req.params.checkinDate;
    if (!isDateKey(checkinDate)) return validationError(res, req, "checkinDate must be a valid YYYY-MM-DD date");
    const checkin = await dailyCheckinRepository.remove(req.user.id, checkinDate);
    return sendSuccess(res, { deleted: Boolean(checkin), checkin });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
