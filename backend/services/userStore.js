const fs = require("fs");
const crypto = require("crypto");
const { getDataFile } = require("./runtimeDataDir");

const DATA_FILE = getDataFile("users.json");

function createInitialData() {
  return {
    users: []
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

  if (!Array.isArray(data.users)) {
    return createInitialData();
  }

  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function createUserId() {
  if (crypto.randomUUID) {
    return `usr_${crypto.randomUUID()}`;
  }
  return `usr_${crypto.randomBytes(16).toString("hex")}`;
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    openid: user.openid || null,
    unionid: user.unionid || null,
    accountName: user.accountName || null,
    passwordHash: user.passwordHash || null,
    nickname: user.nickname || null,
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function findUserById(userId) {
  const data = readData();
  return toPublicUser(data.users.find((user) => user.id === userId));
}

function findOrCreateByWechatProfile(profile) {
  const data = readData();
  const now = new Date().toISOString();
  let user = data.users.find((item) => item.openid === profile.openid);

  if (user) {
    user.unionid = profile.unionid || user.unionid || null;
    user.updatedAt = now;
    writeData(data);
    return toPublicUser(user);
  }

  user = {
    id: createUserId(),
    openid: profile.openid,
    unionid: profile.unionid || null,
    nickname: null,
    avatarUrl: null,
    createdAt: now,
    updatedAt: now
  };
  data.users.push(user);
  writeData(data);

  return toPublicUser(user);
}

function findUserByAccountName(accountName) {
  const data = readData();
  return toPublicUser(data.users.find((user) => user.accountName === accountName));
}

function createAccountUser(accountName, passwordHash) {
  const data = readData();
  const now = new Date().toISOString();
  const user = {
    id: createUserId(),
    openid: null,
    unionid: null,
    accountName,
    passwordHash,
    nickname: accountName,
    avatarUrl: null,
    createdAt: now,
    updatedAt: now
  };

  data.users.push(user);
  writeData(data);
  return toPublicUser(user);
}

function deleteUserById(userId) {
  const data = readData();
  const before = data.users.length;
  data.users = data.users.filter((user) => user.id !== userId);
  writeData(data);
  return data.users.length < before;
}

module.exports = {
  findUserById,
  findOrCreateByWechatProfile,
  findUserByAccountName,
  createAccountUser,
  deleteUserById,
  toPublicUser
};
