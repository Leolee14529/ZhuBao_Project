const crypto = require("crypto");
const fs = require("fs");
const { getDataFile } = require("./runtimeDataDir");

const DATA_FILE = getDataFile("sleep-records.json");

function initialData() {
  return { users: {} };
}

function readData() {
  const startedAt = Date.now();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2), "utf8");
  }

  const readStartedAt = Date.now();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const readMs = Date.now() - readStartedAt;
  const parseStartedAt = Date.now();
  const data = JSON.parse(raw);
  const parseMs = Date.now() - parseStartedAt;
  console.log("[perf:sleep-json]", {
    step: "readData",
    readMs,
    parseMs,
    totalMs: Date.now() - startedAt,
    bytes: Buffer.byteLength(raw, "utf8")
  });
  if (!data.users || typeof data.users !== "object") return initialData();
  return data;
}

function writeData(data) {
  const startedAt = Date.now();
  const stringifyStartedAt = Date.now();
  const raw = JSON.stringify(data, null, 2);
  const stringifyMs = Date.now() - stringifyStartedAt;
  const writeStartedAt = Date.now();
  fs.writeFileSync(DATA_FILE, raw, "utf8");
  console.log("[perf:sleep-json]", {
    step: "writeData",
    stringifyMs,
    writeMs: Date.now() - writeStartedAt,
    totalMs: Date.now() - startedAt,
    bytes: Buffer.byteLength(raw, "utf8")
  });
}

function create(userId, input) {
  const startedAt = Date.now();
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  if (records.some((record) => record.recordDate === input.recordDate)) {
    const error = new Error("SLEEP_RECORD_EXISTS");
    error.code = "SLEEP_RECORD_EXISTS";
    throw error;
  }
  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    recordDate: input.recordDate,
    sleepDurationMinutes: input.sleepDurationMinutes,
    sleepHours: input.sleepHours,
    sleepMinutes: input.sleepMinutes,
    createdAt: now,
    updatedAt: now
  };
  records.push(record);
  data.users[userId] = records;
  writeData(data);
  console.log("[perf:sleep-json]", {
    step: "create",
    totalMs: Date.now() - startedAt,
    userId,
    recordDate: input.recordDate
  });
  return record;
}

function update(userId, recordId, input) {
  const startedAt = Date.now();
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  const index = records.findIndex((record) => record.id === recordId);
  if (index < 0) return null;
  const duplicate = records.find((record) => record.id !== recordId && record.recordDate === input.recordDate);
  if (duplicate) {
    const error = new Error("SLEEP_RECORD_EXISTS");
    error.code = "SLEEP_RECORD_EXISTS";
    throw error;
  }
  const previous = records[index];
  const record = {
    id: previous.id,
    recordDate: input.recordDate,
    sleepDurationMinutes: input.sleepDurationMinutes,
    sleepHours: input.sleepHours,
    sleepMinutes: input.sleepMinutes,
    createdAt: previous.createdAt,
    updatedAt: new Date().toISOString()
  };
  records[index] = record;
  data.users[userId] = records;
  writeData(data);
  console.log("[perf:sleep-json]", {
    step: "update",
    totalMs: Date.now() - startedAt,
    userId,
    recordId,
    recordDate: input.recordDate
  });
  return record;
}

function list(userId, filters) {
  const startedAt = Date.now();
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  const filtered = records
    .filter((record) => (!filters.from || record.recordDate >= filters.from) &&
      (!filters.to || record.recordDate <= filters.to))
    .sort((left, right) => right.recordDate.localeCompare(left.recordDate))
    .slice(0, filters.limit);
  console.log("[perf:sleep-json]", {
    step: "list",
    totalMs: Date.now() - startedAt,
    userId,
    from: filters.from || "",
    to: filters.to || "",
    limit: filters.limit,
    count: filtered.length
  });
  return filtered;
}

module.exports = { create, update, list };
