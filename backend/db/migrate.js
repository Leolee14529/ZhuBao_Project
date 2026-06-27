const fs = require("fs");
const path = require("path");
const { getPool, closePool } = require("./pool");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const name of files) {
      const existing = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [name]
      );
      if (existing.rowCount > 0) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations(name) VALUES ($1)",
        [name]
      );
      console.log(`Applied migration ${name}`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => closePool())
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}

module.exports = migrate;
