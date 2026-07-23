const fs = require("fs");
const { getDataFile } = require("./runtimeDataDir");

const DATA_FILE = getDataFile("wuxing.json");

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

function saveLatestResult(userId, result) {
  const data = readData();
  const savedAt = new Date().toISOString();
  data.users[userId] = {
    latest: { savedAt, result }
  };
  writeData(data);

  return {
    message: "Latest wuxing result saved successfully",
    userId,
    savedAt,
    result
  };
}

function getLatestResult(userId) {
  const data = readData();
  const latest = data.users[userId] && data.users[userId].latest;

  if (!latest) {
    const error = new Error("No saved wuxing result found for this user");
    error.status = 404;
    error.code = "WUXING_RESULT_NOT_FOUND";
    throw error;
  }

  return {
    userId,
    savedAt: latest.savedAt,
    result: latest.result
  };
}

function deleteProfile(userId) {
  const data = readData();
  if (data.users[userId]) {
    delete data.users[userId];
    writeData(data);
  }
  return true;
}

module.exports = {
  saveLatestResult,
  getLatestResult,
  deleteProfile
};
