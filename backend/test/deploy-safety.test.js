const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const deployScript = fs.readFileSync(
  path.join(__dirname, "../scripts/deploy-production.sh"),
  "utf8"
);

test("production deploy stops before package execution unless Node 24 is active", () => {
  const nodeGuard = deployScript.indexOf("NODE_MAJOR");
  const install = deployScript.indexOf("pnpm install --frozen-lockfile");

  assert.ok(nodeGuard >= 0, "deployment must inspect the active Node major version");
  assert.ok(nodeGuard < install, "Node 24 must be verified before pnpm executes");
  assert.match(deployScript, /NODE_MAJOR[^\n]*!=[^\n]*24/);
});

test("production deploy creates and verifies a database backup before migration", () => {
  const backup = deployScript.indexOf("pg_dump");
  const backupVerification = deployScript.indexOf('[[ ! -s "$BACKUP_PATH" ]]');
  const migration = deployScript.indexOf("pnpm run db:migrate");

  assert.match(deployScript, /ZHUBAO_BACKUP_DIR/);
  assert.ok(backup >= 0, "deployment must create a PostgreSQL backup");
  assert.ok(backupVerification > backup, "deployment must reject an empty backup");
  assert.ok(migration > backupVerification, "migration must run only after backup verification");
});
