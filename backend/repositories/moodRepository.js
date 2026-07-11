const crypto = require("crypto");
const moodJsonStore = require("../services/moodJsonStore");
const { hasDatabase, getPool } = require("../db/pool");

function mapMood(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    tag: row.tag,
    emoji: row.emoji,
    theme_color: row.theme_color,
    bg_color: row.bg_color,
    text_color: row.text_color,
    icon_url: row.icon_url || "",
    background_url: row.background_url || "",
    background_mood: row.background_mood || "",
    encouragement: row.encouragement || "",
    weight: Number(row.weight || 1),
    status: row.status,
    generated_at: row.generated_at ? new Date(row.generated_at).toISOString() : null
  };
}

async function getEnabledTemplates() {
  if (!hasDatabase()) {
    return moodJsonStore.getEnabledTemplates();
  }

  const result = await getPool().query(
    `SELECT *
     FROM mood_templates
     WHERE status = 'enabled'
     ORDER BY id`
  );
  return result.rows.map(mapMood);
}

async function findDailyMood(ownerId, moodDate) {
  if (!hasDatabase()) {
    return moodJsonStore.findDailyMood(ownerId, moodDate);
  }

  const result = await getPool().query(
    `SELECT mt.*, udm.generated_at
     FROM user_daily_mood udm
     INNER JOIN mood_templates mt ON mt.id = udm.mood_id
     WHERE udm.user_id = $1 AND udm.mood_date = $2
     LIMIT 1`,
    [ownerId, moodDate]
  );
  return mapMood(result.rows[0]);
}

async function getPreviousMoodId(ownerId, beforeDate) {
  if (!hasDatabase()) {
    return moodJsonStore.getPreviousMoodId(ownerId, beforeDate);
  }

  const result = await getPool().query(
    `SELECT mood_id
     FROM user_daily_mood
     WHERE user_id = $1 AND mood_date < $2
     ORDER BY mood_date DESC
     LIMIT 1`,
    [ownerId, beforeDate]
  );
  return result.rows[0] ? result.rows[0].mood_id : "";
}

async function createDailyMood(ownerId, moodId, moodDate) {
  if (!hasDatabase()) {
    return moodJsonStore.createDailyMood(ownerId, moodId, moodDate);
  }

  const pool = getPool();
  const result = await pool.query(
    `WITH inserted AS (
       INSERT INTO user_daily_mood(id, user_id, mood_id, mood_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, mood_date) DO NOTHING
       RETURNING mood_id, generated_at
     )
     SELECT mt.*, inserted.generated_at
     FROM inserted
     INNER JOIN mood_templates mt ON mt.id = inserted.mood_id`,
    [crypto.randomUUID(), ownerId, moodId, moodDate]
  );

  if (result.rows[0]) return mapMood(result.rows[0]);
  return findDailyMood(ownerId, moodDate);
}

async function deleteOwnerMood(ownerId) {
  if (!hasDatabase()) {
    return moodJsonStore.deleteOwnerMood(ownerId);
  }

  const result = await getPool().query(
    "DELETE FROM user_daily_mood WHERE user_id = $1",
    [ownerId]
  );
  return result.rowCount;
}

module.exports = {
  getEnabledTemplates,
  findDailyMood,
  getPreviousMoodId,
  createDailyMood,
  deleteOwnerMood
};
