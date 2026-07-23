const crypto = require("crypto");
const jsonStore = require("../services/sleepRecordJsonStore");
const { hasDatabase, getPool } = require("../db/pool");

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS sleep_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    sleep_duration_minutes SMALLINT NOT NULL CHECK (sleep_duration_minutes BETWEEN 1 AND 1440),
    sleep_hours SMALLINT NOT NULL CHECK (sleep_hours BETWEEN 0 AND 24),
    sleep_minutes SMALLINT NOT NULL CHECK (sleep_minutes BETWEEN 0 AND 59),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sleep_records_user_date_unique UNIQUE (user_id, record_date)
  );

  CREATE INDEX IF NOT EXISTS sleep_records_user_date_idx
    ON sleep_records(user_id, record_date DESC);
`;

function formatDateKey(value) {
  if (typeof value === "string") return value.slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function mapRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    recordDate: formatDateKey(row.record_date),
    sleepDurationMinutes: Number(row.sleep_duration_minutes),
    sleepHours: Number(row.sleep_hours),
    sleepMinutes: Number(row.sleep_minutes),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

function isMissingTableError(error) {
  return Boolean(error && (error.code === "42P01" || /sleep_records/i.test(error.message || "")));
}

async function ensureTable() {
  await getPool().query(CREATE_TABLE_SQL);
}

async function create(userId, input) {
  if (!hasDatabase()) return jsonStore.create(userId, input);
  try {
    const result = await getPool().query(
      `INSERT INTO sleep_records(
         id, user_id, record_date, sleep_duration_minutes, sleep_hours, sleep_minutes
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        crypto.randomUUID(),
        userId,
        input.recordDate,
        input.sleepDurationMinutes,
        input.sleepHours,
        input.sleepMinutes
      ]
    );
    return mapRecord(result.rows[0]);
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    await ensureTable();
    return create(userId, input);
  }
}

async function update(userId, recordId, input) {
  if (!hasDatabase()) return jsonStore.update(userId, recordId, input);
  try {
    const result = await getPool().query(
      `UPDATE sleep_records
       SET record_date = $3,
           sleep_duration_minutes = $4,
           sleep_hours = $5,
           sleep_minutes = $6,
           updated_at = NOW()
       WHERE user_id = $1 AND id = $2
       RETURNING *`,
      [
        userId,
        recordId,
        input.recordDate,
        input.sleepDurationMinutes,
        input.sleepHours,
        input.sleepMinutes
      ]
    );
    return mapRecord(result.rows[0]);
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    await ensureTable();
    return update(userId, recordId, input);
  }
}

async function list(userId, filters) {
  if (!hasDatabase()) return jsonStore.list(userId, filters);
  try {
    const clauses = ["user_id = $1"];
    const values = [userId];
    if (filters.from) {
      values.push(filters.from);
      clauses.push(`record_date >= $${values.length}`);
    }
    if (filters.to) {
      values.push(filters.to);
      clauses.push(`record_date <= $${values.length}`);
    }
    values.push(filters.limit);
    const result = await getPool().query(
      `SELECT * FROM sleep_records
       WHERE ${clauses.join(" AND ")}
       ORDER BY record_date DESC
       LIMIT $${values.length}`,
      values
    );
    return result.rows.map(mapRecord);
  } catch (error) {
    if (!isMissingTableError(error)) throw error;
    await ensureTable();
    return list(userId, filters);
  }
}

module.exports = { create, update, list };
