const crypto = require("crypto");
const jsonStore = require("../services/dailyCheckinJsonStore");
const { hasDatabase, getPool } = require("../db/pool");

function formatDateKey(value) {
  if (typeof value === "string") return value.slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function mapRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    checkinDate: formatDateKey(row.checkin_date),
    mood: Number(row.mood),
    energy: Number(row.energy),
    sleepMinutes: Number(row.sleep_minutes),
    isWearingJewelry: Boolean(row.is_wearing_jewelry),
    tags: Array.isArray(row.tags) ? row.tags : [],
    note: row.note || "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

async function upsert(userId, input) {
  if (!hasDatabase()) return jsonStore.upsert(userId, input);

  const result = await getPool().query(
    `INSERT INTO daily_checkins(
       id, user_id, checkin_date, mood, energy, sleep_minutes,
       is_wearing_jewelry, tags, note
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     ON CONFLICT (user_id, checkin_date) DO UPDATE SET
       mood = EXCLUDED.mood,
       energy = EXCLUDED.energy,
       sleep_minutes = EXCLUDED.sleep_minutes,
       is_wearing_jewelry = EXCLUDED.is_wearing_jewelry,
       tags = EXCLUDED.tags,
       note = EXCLUDED.note,
       updated_at = NOW()
     RETURNING *`,
    [
      crypto.randomUUID(),
      userId,
      input.checkinDate,
      input.mood,
      input.energy,
      input.sleepMinutes,
      input.isWearingJewelry,
      JSON.stringify(input.tags),
      input.note
    ]
  );
  return mapRecord(result.rows[0]);
}

async function list(userId, filters) {
  if (!hasDatabase()) return jsonStore.list(userId, filters);

  const clauses = ["user_id = $1"];
  const values = [userId];
  if (filters.from) {
    values.push(filters.from);
    clauses.push(`checkin_date >= $${values.length}`);
  }
  if (filters.to) {
    values.push(filters.to);
    clauses.push(`checkin_date <= $${values.length}`);
  }
  values.push(filters.limit);
  const result = await getPool().query(
    `SELECT * FROM daily_checkins
     WHERE ${clauses.join(" AND ")}
     ORDER BY checkin_date DESC
     LIMIT $${values.length}`,
    values
  );
  return result.rows.map(mapRecord);
}

async function remove(userId, checkinDate) {
  if (!hasDatabase()) return jsonStore.remove(userId, checkinDate);

  const result = await getPool().query(
    `DELETE FROM daily_checkins
     WHERE user_id = $1 AND checkin_date = $2
     RETURNING *`,
    [userId, checkinDate]
  );
  return mapRecord(result.rows[0]);
}

async function removeByUserId(userId) {
  if (!hasDatabase()) return jsonStore.removeByUserId(userId);
  await getPool().query("DELETE FROM daily_checkins WHERE user_id = $1", [userId]);
  return true;
}

module.exports = {
  upsert,
  list,
  remove,
  removeByUserId
};
