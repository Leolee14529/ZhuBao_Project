const fs = require("fs");
const crypto = require("crypto");
const { getDataFile } = require("./runtimeDataDir");

const DATA_FILE = getDataFile("sessions.json");
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
  return data.sessions.find((session) => (
    session.tokenHash === tokenHash && !session.revokedAt
  )) || null;
}

function revokeSessionByToken(token) {
  const data = readData();
  const tokenHash = hashToken(token);
  const session = data.sessions.find((item) => (
    item.tokenHash === tokenHash && !item.revokedAt
  ));

  if (!session) {
    return false;
  }

  session.revokedAt = new Date().toISOString();
  writeData(data);
  return true;
}

function revokeSessionsByUserId(userId) {
  const data = readData();
  const now = new Date().toISOString();
  let count = 0;

  data.sessions.forEach((session) => {
    if (session.userId === userId && !session.revokedAt) {
      session.revokedAt = now;
      count += 1;
    }
  });

  if (count > 0) {
    writeData(data);
  }
  return count;
}

module.exports = {
  createSession,
  findSessionByToken,
  revokeSessionByToken,
  revokeSessionsByUserId,
  isSessionExpired,
  hashToken
};
