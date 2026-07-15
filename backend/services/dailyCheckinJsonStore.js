const crypto = require("crypto");
const fs = require("fs");
const { getDataFile } = require("./runtimeDataDir");

const DATA_FILE = getDataFile("daily-checkins.json");

function initialData() {
  return { users: {} };
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2), "utf8");
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!data.users || typeof data.users !== "object") return initialData();
  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function upsert(userId, input) {
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  const now = new Date().toISOString();
  const index = records.findIndex((record) => record.checkinDate === input.checkinDate);
  const previous = index >= 0 ? records[index] : null;
  const record = {
    id: previous ? previous.id : crypto.randomUUID(),
    checkinDate: input.checkinDate,
    mood: input.mood,
    energy: input.energy,
    sleepMinutes: input.sleepMinutes,
    isWearingJewelry: input.isWearingJewelry,
    tags: input.tags,
    note: input.note,
    createdAt: previous ? previous.createdAt : now,
    updatedAt: now
  };

  if (previous) records[index] = record;
  else records.push(record);
  data.users[userId] = records;
  writeData(data);
  return record;
}

function list(userId, filters) {
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  return records
    .filter((record) => (!filters.from || record.checkinDate >= filters.from) &&
      (!filters.to || record.checkinDate <= filters.to))
    .sort((left, right) => right.checkinDate.localeCompare(left.checkinDate))
    .slice(0, filters.limit);
}

function remove(userId, checkinDate) {
  const data = readData();
  const records = Array.isArray(data.users[userId]) ? data.users[userId] : [];
  const index = records.findIndex((record) => record.checkinDate === checkinDate);
  if (index < 0) return null;

  const [record] = records.splice(index, 1);
  data.users[userId] = records;
  writeData(data);
  return record;
}

function removeByUserId(userId) {
  const data = readData();
  if (!data.users[userId]) return false;
  delete data.users[userId];
  writeData(data);
  return true;
}

module.exports = {
  upsert,
  list,
  remove,
  removeByUserId
};
