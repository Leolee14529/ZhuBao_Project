const crypto = require("crypto");
const userStore = require("../services/userStore");
const { hasDatabase, getPool } = require("../db/pool");

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    openid: row.openid,
    unionid: row.unionid || null,
    nickname: row.nickname || null,
    avatarUrl: row.avatar_url || null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

function toClientUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nickname: user.nickname || null,
    avatarUrl: user.avatarUrl || null
  };
}

async function findUserById(userId) {
  if (!hasDatabase()) {
    return userStore.findUserById(userId);
  }

  const result = await getPool().query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );
  return mapUser(result.rows[0]);
}

async function deleteUserById(userId) {
  if (!hasDatabase()) {
    return userStore.deleteUserById(userId);
  }

  const result = await getPool().query(
    "DELETE FROM users WHERE id = $1",
    [userId]
  );
  return result.rowCount > 0;
}

async function findOrCreateByWechatProfile(profile) {
  if (!hasDatabase()) {
    return userStore.findOrCreateByWechatProfile(profile);
  }

  const result = await getPool().query(
    `INSERT INTO users(id, openid, unionid)
     VALUES ($1, $2, $3)
     ON CONFLICT (openid) DO UPDATE SET
       unionid = COALESCE(EXCLUDED.unionid, users.unionid),
       updated_at = NOW()
     RETURNING *`,
    [crypto.randomUUID(), profile.openid, profile.unionid || null]
  );
  return mapUser(result.rows[0]);
}

module.exports = {
  findUserById,
  findOrCreateByWechatProfile,
  deleteUserById,
  toClientUser
};
