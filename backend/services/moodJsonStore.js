const fs = require("fs");
const { getDataFile } = require("./runtimeDataDir");
const { buildMoodTemplates } = require("./moodTemplateData");

const DATA_FILE = getDataFile("moods.json");

function initialData() {
  return { records: [] };
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2), "utf8");
  }
}

function readData() {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(data.records)) return initialData();
  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function getEnabledTemplates() {
  return buildMoodTemplates().filter((item) => item.status === "enabled");
}

function findTemplate(moodId) {
  return getEnabledTemplates().find((item) => item.id === moodId) || null;
}

function findDailyMood(ownerId, moodDate) {
  const data = readData();
  const record = data.records.find((item) => (
    item.userId === ownerId && item.date === moodDate
  ));
  if (!record) return null;

  const template = findTemplate(record.moodId);
  if (!template) return null;
  return Object.assign({}, template, {
    generated_at: record.generatedAt
  });
}

function getPreviousMoodId(ownerId, beforeDate) {
  const data = readData();
  const records = data.records
    .filter((item) => item.userId === ownerId && item.date < beforeDate)
    .sort((left, right) => right.date.localeCompare(left.date));
  return records[0] ? records[0].moodId : "";
}

function createDailyMood(ownerId, moodId, moodDate) {
  const data = readData();
  const existing = data.records.find((item) => (
    item.userId === ownerId && item.date === moodDate
  ));

  if (existing) {
    const template = findTemplate(existing.moodId);
    return Object.assign({}, template, {
      generated_at: existing.generatedAt
    });
  }

  const generatedAt = new Date().toISOString();
  data.records.push({
    userId: ownerId,
    moodId,
    date: moodDate,
    generatedAt
  });
  writeData(data);

  return Object.assign({}, findTemplate(moodId), {
    generated_at: generatedAt
  });
}

function deleteOwnerMood(ownerId) {
  const data = readData();
  const before = data.records.length;
  data.records = data.records.filter((item) => item.userId !== ownerId);
  if (data.records.length !== before) writeData(data);
  return before - data.records.length;
}

module.exports = {
  getEnabledTemplates,
  findDailyMood,
  getPreviousMoodId,
  createDailyMood,
  deleteOwnerMood
};
