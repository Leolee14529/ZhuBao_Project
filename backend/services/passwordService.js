const crypto = require("crypto");

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
const ACCOUNT_NAME_PATTERN = /^[a-z0-9][a-z0-9_.@-]{2,63}$/;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const DUMMY_PASSWORD = "DummyPassw0rd2026";
let dummyHashPromise = null;

function normalizeAccountName(value) {
  return String(value || "").trim().toLowerCase();
}

function validateAccountName(value) {
  const accountName = normalizeAccountName(value);
  if (!ACCOUNT_NAME_PATTERN.test(accountName)) {
    const error = new Error("账号需为 3-64 位字母、数字或 . _ @ -");
    error.status = 400;
    error.code = "ACCOUNT_NAME_INVALID";
    throw error;
  }
  return accountName;
}

function validatePassword(value) {
  if (typeof value !== "string") {
    const error = new Error("密码需为 8-72 位且包含字母和数字");
    error.status = 400;
    error.code = "PASSWORD_INVALID";
    throw error;
  }
  const password = value;
  if (!isValidPasswordInput(password)) {
    const error = new Error("密码需为 8-72 位且包含字母和数字");
    error.status = 400;
    error.code = "PASSWORD_INVALID";
    throw error;
  }
  return password;
}

function isValidPasswordInput(value) {
  return typeof value === "string" &&
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value);
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, {
      cost: SCRYPT_COST,
      blockSize: SCRYPT_BLOCK_SIZE,
      parallelization: SCRYPT_PARALLELIZATION,
      maxmem: 32 * 1024 * 1024
    }, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

async function hashPassword(password) {
  const safePassword = validatePassword(password);
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = await scrypt(safePassword, salt);
  return [
    "scrypt",
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt,
    key.toString("base64url")
  ].join("$");
}

async function verifyPassword(password, storedHash) {
  const parts = String(storedHash || "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const key = await scrypt(typeof password === "string" ? password : "", parts[4]);
  const expected = Buffer.from(parts[5], "base64url");
  if (expected.length !== key.length) return false;
  return crypto.timingSafeEqual(expected, key);
}

function getDummyPasswordHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(DUMMY_PASSWORD);
  }
  return dummyHashPromise;
}

module.exports = {
  normalizeAccountName,
  validateAccountName,
  validatePassword,
  isValidPasswordInput,
  hashPassword,
  verifyPassword,
  getDummyPasswordHash
};
