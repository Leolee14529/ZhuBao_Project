const crypto = require("crypto");
const {
  saveLatestResult: saveJsonResult,
  getLatestResult: getJsonResult,
  deleteProfile: deleteJsonResult
} = require("../services/wuxingJsonStore");
const { sanitizeWuxingResult } = require("../services/wuxingResultPresenter");
const { hasDatabase, getPool } = require("../db/pool");

const ALGORITHM_VERSION = "1.0.0";

async function saveLatestResult(userId, input, result) {
  const safeResult = sanitizeWuxingResult(result);

  if (!hasDatabase()) {
    return saveJsonResult(userId, safeResult);
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const profile = await client.query(
      `INSERT INTO birth_profiles(id, user_id, birth_date, birth_time, gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         birth_date = EXCLUDED.birth_date,
         birth_time = EXCLUDED.birth_time,
         gender = EXCLUDED.gender,
         updated_at = NOW()
       RETURNING id`,
      [crypto.randomUUID(), userId, input.birthDate, input.birthTime, input.gender]
    );

    const saved = await client.query(
      `INSERT INTO wuxing_results(
         id, user_id, birth_profile_id, algorithm_version, result_json
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING created_at`,
      [
        crypto.randomUUID(),
        userId,
        profile.rows[0].id,
        ALGORITHM_VERSION,
        JSON.stringify(safeResult)
      ]
    );
    await client.query("COMMIT");

    return {
      message: "Latest wuxing result saved successfully",
      userId,
      savedAt: new Date(saved.rows[0].created_at).toISOString(),
      result: safeResult
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getLatestResult(userId) {
  if (!hasDatabase()) {
    const jsonResult = await getJsonResult(userId);
    return Object.assign({}, jsonResult, {
      result: sanitizeWuxingResult(jsonResult.result)
    });
  }

  const result = await getPool().query(
    `SELECT result_json, created_at
     FROM wuxing_results
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error("No saved wuxing result found for this user");
    error.status = 404;
    error.code = "WUXING_RESULT_NOT_FOUND";
    throw error;
  }

  return {
    userId,
    savedAt: new Date(result.rows[0].created_at).toISOString(),
    result: sanitizeWuxingResult(result.rows[0].result_json)
  };
}

async function deleteProfile(userId) {
  if (!hasDatabase()) {
    return deleteJsonResult(userId);
  }

  await getPool().query(
    "DELETE FROM birth_profiles WHERE user_id = $1",
    [userId]
  );
  return true;
}

module.exports = {
  saveLatestResult,
  getLatestResult,
  deleteProfile,
  ALGORITHM_VERSION
};
