const request = require("./request");
const config = require("./config");

function getSleepApiBaseUrl() {
  return config.getApiBaseUrl();
}

function listByDate(recordDate, options) {
  return request.get("/api/sleep-records", {
    from: recordDate,
    to: recordDate,
    limit: 1
  }).then((data) => {
    const records = Array.isArray(data.records) ? data.records : [];
    console.log("[sleep-runtime:response]", {
      source: options && options.source ? options.source : "listByDate",
      recordCount: records.length,
      records: records.map((record) => ({
        id: record && record.id,
        recordDate: record && record.recordDate,
        sleepDurationMinutes: record && record.sleepDurationMinutes,
        sleepHours: record && record.sleepHours,
        sleepMinutes: record && record.sleepMinutes
      }))
    });
    return records;
  });
}

function listRange(from, to, limit, options) {
  return request.get("/api/sleep-records", {
    from,
    to,
    limit: limit || 7
  }).then((data) => {
    const records = Array.isArray(data.records) ? data.records : [];
    console.log("[sleep-runtime:response]", {
      source: options && options.source ? options.source : "listRange",
      from,
      to,
      recordCount: records.length,
      records: records.map((record) => ({
        id: record && record.id,
        recordDate: record && record.recordDate,
        sleepDurationMinutes: record && record.sleepDurationMinutes,
        sleepHours: record && record.sleepHours,
        sleepMinutes: record && record.sleepMinutes
      }))
    });
    return records;
  });
}

function create(record, options) {
  return request.post("/api/sleep-records", record).then((data) => {
    const savedRecord = data.record || null;
    console.log("[sleep-runtime:response]", {
      source: options && options.source ? options.source : "create",
      record: savedRecord
    });
    return savedRecord;
  });
}

function update(recordId, record, options) {
  return request.put("/api/sleep-records/" + encodeURIComponent(recordId), record).then((data) => {
    const savedRecord = data.record || null;
    console.log("[sleep-runtime:response]", {
      source: options && options.source ? options.source : "update",
      record: savedRecord
    });
    return savedRecord;
  });
}

module.exports = {
  getSleepApiBaseUrl,
  listByDate,
  listRange,
  create,
  update
};
