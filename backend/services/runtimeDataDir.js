const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const BACKEND_ROOT = path.resolve(__dirname, "..");

function getDefaultRuntimeDataDir() {
  if (process.env.NODE_ENV === "production") {
    return path.join(BACKEND_ROOT, "data");
  }

  const projectHash = crypto.createHash("sha1").update(BACKEND_ROOT).digest("hex").slice(0, 8);
  return path.join(os.tmpdir(), `zhubao-backend-data-${projectHash}`);
}

const RUNTIME_DATA_DIR = process.env.ZHUBAO_DATA_DIR
  ? path.resolve(process.env.ZHUBAO_DATA_DIR)
  : getDefaultRuntimeDataDir();

function ensureRuntimeDataDir() {
  fs.mkdirSync(RUNTIME_DATA_DIR, { recursive: true });
}

function getDataFile(filename) {
  ensureRuntimeDataDir();
  return path.join(RUNTIME_DATA_DIR, filename);
}

module.exports = {
  RUNTIME_DATA_DIR,
  getDataFile
};
