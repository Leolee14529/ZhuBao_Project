const request = require("./request");

function toDateKey(date) {
  const value = date || new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function listByDate(dateKey) {
  return request.get("/api/daily-checkins", {
    from: dateKey,
    to: dateKey,
    limit: 1
  }).then((data) => {
    const records = Array.isArray(data.checkins) ? data.checkins : [];
    console.log("[daily-runtime:response]", {
      source: "listByDate",
      recordCount: records.length,
      records: records.map((record) => ({
        userId: record && record.userId,
        recordDate: record && record.checkinDate,
        mood: record && record.mood,
        energy: record && record.energy,
        tags: record && record.tags,
        sleepMinutes: record && record.sleepMinutes
      }))
    });
    return records;
  });
}

function listRange(from, to, limit) {
  return request.get("/api/daily-checkins", {
    from,
    to,
    limit: limit || 7
  }).then((data) => {
    const records = Array.isArray(data.checkins) ? data.checkins : [];
    console.log("[daily-runtime:response]", {
      source: "listRange",
      from,
      to,
      recordCount: records.length,
      records: records.map((record) => ({
        userId: record && record.userId,
        recordDate: record && record.checkinDate,
        mood: record && record.mood,
        energy: record && record.energy,
        tags: record && record.tags,
        sleepMinutes: record && record.sleepMinutes
      }))
    });
    return records;
  });
}

function save(checkin) {
  return request.post("/api/daily-checkins", checkin).then((data) => data.checkin || null);
}

function remove(dateKey) {
  return request.delete("/api/daily-checkins/" + encodeURIComponent(dateKey)).then((data) => data.checkin || null);
}

module.exports = { listByDate, listRange, remove, save, toDateKey };
