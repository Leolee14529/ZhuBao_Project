const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "../data/sessions.json");
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createInitialData() {
  return {
    sessions: []
  };
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(createInitialData(), null, 2), "utf8");
  }
}

function readData() {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  if (!Array.isArray(data.sessions)) {
    return createInitialData();
  }

  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function isSessionExpired(session) {
  return !session.expiresAt || Date.parse(session.expiresAt) <= Date.now();
}

function createSession(user) {
  const data = readData();
  const now = new Date();
  const token = createToken();
  const session = {
    tokenHash: hashToken(token),
    userId: user.id,
    openid: user.openid,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString()
  };

  data.sessions = data.sessions.filter((item) => !isSessionExpired(item));
  data.sessions.push(session);
  writeData(data);

  return {
    token,
    session
  };
}

function findSessionByToken(token) {
  const data = readData();
  const tokenHash = hashToken(token);
  return data.sessions.find((session) => session.tokenHash === tokenHash) || null;
}

module.exports = {
  createSession,
  findSessionByToken,
  isSessionExpired,
  hashToken
};
