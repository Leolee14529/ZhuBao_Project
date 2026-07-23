const crypto = require("crypto");
const sessionStore = require("../services/sessionStore");
const { hasDatabase, getPool } = require("../db/pool");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function mapSession(row) {
  if (!row) return null;

  return {
    id: row.id,
    tokenHash: row.token_hash,
    userId: row.user_id,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : null
  };
}

function isSessionExpired(session) {
  return !session.expiresAt || Date.parse(session.expiresAt) <= Date.now();
}

async function createSession(user) {
  if (!hasDatabase()) {
    return sessionStore.createSession(user);
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const result = await getPool().query(
    `INSERT INTO auth_sessions(id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [crypto.randomUUID(), user.id, hashToken(token), expiresAt]
  );

  return {
    token,
    session: mapSession(result.rows[0])
  };
}

async function findSessionByToken(token) {
  if (!hasDatabase()) {
    return sessionStore.findSessionByToken(token);
  }

  const result = await getPool().query(
    `SELECT * FROM auth_sessions
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [hashToken(token)]
  );
  return mapSession(result.rows[0]);
}

async function revokeSessionByToken(token) {
  if (!hasDatabase()) {
    return sessionStore.revokeSessionByToken(token);
  }

  const result = await getPool().query(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [hashToken(token)]
  );
  return result.rowCount > 0;
}

async function revokeSessionsByUserId(userId) {
  if (!hasDatabase()) {
    return sessionStore.revokeSessionsByUserId(userId);
  }

  const result = await getPool().query(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
  return result.rowCount;
}

module.exports = {
  createSession,
  findSessionByToken,
  revokeSessionByToken,
  revokeSessionsByUserId,
  isSessionExpired
};
