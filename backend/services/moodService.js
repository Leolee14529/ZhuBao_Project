const crypto = require("crypto");
const moodRepository = require("../repositories/moodRepository");

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateKeyFromShiftedDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBeijingMoodCycle(now = new Date()) {
  const shifted = new Date(now.getTime() + BEIJING_OFFSET_MS);
  const hour = shifted.getUTCHours();
  const cycleTime = hour < 12 ? shifted.getTime() - DAY_MS : shifted.getTime();
  const cycleDate = formatDateKeyFromShiftedDate(new Date(cycleTime));

  return {
    date: cycleDate,
    updatedAt: `${cycleDate} 12:00:00`
  };
}

function normalizeWeight(template) {
  const weight = Number(template && template.weight);
  return Number.isFinite(weight) && weight > 0 ? Math.floor(weight) : 1;
}

function selectWeightedMood(templates, previousMoodId) {
  const enabled = templates.filter((item) => item && item.status === "enabled");
  const candidates = enabled.length > 1
    ? enabled.filter((item) => item.id !== previousMoodId)
    : enabled;
  const pool = candidates.length > 0 ? candidates : enabled;
  const totalWeight = pool.reduce((sum, item) => sum + normalizeWeight(item), 0);

  if (totalWeight <= 0) return pool[0] || null;

  let ticket = crypto.randomInt(totalWeight);
  for (const item of pool) {
    ticket -= normalizeWeight(item);
    if (ticket < 0) return item;
  }
  return pool[pool.length - 1] || null;
}

function toClientMood(mood, cycle) {
  return {
    mood_id: mood.id,
    name: mood.name,
    description: mood.description,
    tag: mood.tag,
    emoji: mood.emoji,
    theme_color: mood.theme_color,
    bg_color: mood.bg_color,
    text_color: mood.text_color,
    icon_url: mood.icon_url,
    background_url: mood.background_url,
    background_mood: mood.background_mood,
    encouragement: mood.encouragement,
    date: cycle.date,
    updated_at: cycle.updatedAt,
    generated_at: mood.generated_at
  };
}

async function getTodayMood(ownerId, now = new Date()) {
  const cycle = getBeijingMoodCycle(now);
  const existing = await moodRepository.findDailyMood(ownerId, cycle.date);
  if (existing) return toClientMood(existing, cycle);

  const templates = await moodRepository.getEnabledTemplates();
  if (templates.length === 0) {
    const error = new Error("No enabled mood templates found");
    error.status = 503;
    error.code = "MOOD_TEMPLATE_EMPTY";
    throw error;
  }

  const previousMoodId = await moodRepository.getPreviousMoodId(ownerId, cycle.date);
  const selected = selectWeightedMood(templates, previousMoodId);
  const saved = await moodRepository.createDailyMood(ownerId, selected.id, cycle.date);
  return toClientMood(saved, cycle);
}

module.exports = {
  getTodayMood,
  getBeijingMoodCycle,
  selectWeightedMood
};
