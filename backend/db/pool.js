const { Pool } = require("pg");

let pool;

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined
    });
  }

  return pool;
}

async function checkDatabase() {
  if (!hasDatabase()) {
    return {
      configured: false,
      healthy: process.env.NODE_ENV !== "production"
    };
  }

  try {
    await getPool().query("SELECT 1");
    return { configured: true, healthy: true };
  } catch (error) {
    return { configured: true, healthy: false };
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  hasDatabase,
  getPool,
  checkDatabase,
  closePool
};
