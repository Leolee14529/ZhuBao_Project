const auth = require("../../../../utils/auth");
const dailyCheckins = require("../../../../utils/daily-checkins");
const i18n = require("../../../../utils/i18n");
const sleepRecords = require("../../../../utils/sleep-records");
const recordViewModel = require("../../utils/daily-record-view-model");

const DEFAULT_SLEEP_HOURS = "";
const DEFAULT_SLEEP_MINUTES = "";

function toTrendRecords(records) {
  return (Array.isArray(records) ? records : []).map((item) => ({
    checkinDate: item.recordDate,
    sleepMinutes: item.sleepDurationMinutes
  }));
}

function formatModalDate(dateKey) {
  if (!dateKey) return "";
  const parts = String(dateKey).split("-");
  if (parts.length !== 3) return dateKey;
  return Number(parts[0]) + "年" + Number(parts[1]) + "月" + Number(parts[2]) + "日";
}

function normalizeNumberInput(value) {
  return String(value === undefined || value === null ? "" : value).replace(/[^\d]/g, "");
}

function sanitizeHoursInput(value) {
  const text = normalizeNumberInput(value);
  if (!text) return "";
  const numeric = Math.min(24, Math.max(0, Number(text)));
  return String(Math.floor(numeric));
}

function sanitizeMinutesInput(value, hoursValue) {
  const text = normalizeNumberInput(value);
  if (!text) return "";
  let numeric = Math.min(59, Math.max(0, Number(text)));
  const hours = Number(normalizeNumberInput(hoursValue || 0));
  if (hours >= 24) numeric = 0;
  return String(Math.floor(numeric));
}

function upsertSleepRecord(records, nextRecord) {
  const list = Array.isArray(records) ? records.slice() : [];
  if (!nextRecord || !nextRecord.recordDate) return list;
  const nextDate = String(nextRecord.recordDate);
  const nextId = nextRecord.id || "";
  const filtered = list.filter((item) => {
    if (!item) return false;
    if (nextId && item.id && item.id === nextId) return false;
    return String(item.recordDate || "") !== nextDate;
  });
  filtered.push(nextRecord);
  return filtered.sort((left, right) => String(right.recordDate || "").localeCompare(String(left.recordDate || "")));
}

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("sleepDetail"),
    date: "",
    sleep: "--",
    rangeMode: "day",
    anchorDateKey: dailyCheckins.toDateKey(),
    trend: recordViewModel.buildSleepTrend([], dailyCheckins.toDateKey(), "day", i18n.getCopy("sleepDetail")),
    canMoveNext: false,
    hasRecord: false,
    loading: true,
    loadError: "",
    showSleepModal: false,
    sleepRecordDate: dailyCheckins.toDateKey(),
    sleepRecordDateText: formatModalDate(dailyCheckins.toDateKey()),
    sleepHours: DEFAULT_SLEEP_HOURS,
    sleepMinutes: DEFAULT_SLEEP_MINUTES,
    sleepRecordId: "",
    sleepRecordLoadError: "",
    isLoadingSleepModalRecord: false,
    isEditingSleepRecord: false,
    isSavingSleepRecord: false,
    isRefreshingSleepRecord: false
  },
  onLoad() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/sleep-detail/index" })) return;
    const app = getApp();
    const nav = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (nav && nav.contentOffset) this.setData({ topSpacer: nav.contentOffset });
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
    this.applyLocale();
  },
  onShow() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/sleep-detail/index" })) return;
    let userInfo = null;
    let token = "";
    try {
      userInfo = wx.getStorageSync("userInfo");
      token = wx.getStorageSync("token");
    } catch (error) {
      console.error("[sleep-detail:onShow:storageError]", error);
    }
    console.log("[sleep-detail:onShow]", {
      userId: userInfo && userInfo.id ? userInfo.id : "",
      anchorDateKey: this.data.anchorDateKey,
      rangeMode: this.data.rangeMode,
      hasToken: Boolean(token)
    });
    this.loadSleepRecord({ source: "onShow" });
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  },
  applySleepView(records, source) {
    const applyStartedAt = Date.now();
    this.currentSleepRecords = Array.isArray(records) ? records : [];
    const trend = recordViewModel.buildSleepTrend(
      toTrendRecords(this.currentSleepRecords),
      this.data.anchorDateKey,
      this.data.rangeMode,
      this.data.copy
    );
    const nextSleep = this.getFocusedSleep(trend, this.data.copy);
    console.log("[sleep-detail:load:view]", {
      hasRecords: trend.hasRecords,
      points: trend.points,
      focusedSleep: nextSleep
    });
    this.setData({
      hasRecord: trend.hasRecords,
      trend,
      date: this.formatRange(trend),
      sleep: nextSleep,
      canMoveNext: this.data.anchorDateKey < dailyCheckins.toDateKey()
    }, () => {
      console.log("[perf:sleep-view]", {
        source: source || "",
        step: "applySleepView-setData",
        durationMs: Date.now() - applyStartedAt
      });
    });
  },
  applyLocale() {
    const copy = i18n.getCopy("sleepDetail");
    const trend = recordViewModel.buildSleepTrend(toTrendRecords(this.currentSleepRecords), this.data.anchorDateKey, this.data.rangeMode, copy);
    this.setData({
      copy,
      trend,
      date: this.formatRange(trend),
      sleep: this.getFocusedSleep(trend, copy),
      sleepRecordDateText: formatModalDate(this.data.sleepRecordDate || this.data.anchorDateKey)
    });
  },
  loadSleepRecord(options) {
    const startedAt = Date.now();
    const loadOptions = options || {};
    const source = loadOptions.source || "unknown";
    const range = recordViewModel.buildSleepRange(this.data.anchorDateKey, this.data.rangeMode);
    this._sleepLoadRequestSeq = (this._sleepLoadRequestSeq || 0) + 1;
    const requestId = this._sleepLoadRequestSeq;
    this._sleepLoadRequestId = requestId;
    console.log("[sleep-detail:source]", {
      selectedDate: this.data.anchorDateKey,
      apiBaseUrl: sleepRecords.getSleepApiBaseUrl ? sleepRecords.getSleepApiBaseUrl() : "",
      requestUrl: ((sleepRecords.getSleepApiBaseUrl ? sleepRecords.getSleepApiBaseUrl() : "") || "") + "/api/sleep-records"
    });
    console.log("[sleep-detail:load:start]", {
      selectedDate: this.data.anchorDateKey,
      rangeMode: this.data.rangeMode,
      from: range.from,
      to: range.to,
      limit: range.limit,
      requestId,
      source
    });
    console.log("[sleep-load:start]", {
      source,
      requestId,
      from: range.from,
      to: range.to,
      limit: range.limit
    });
    this.setData({ loading: true, loadError: "" });
    return sleepRecords.listRange(range.from, range.to, range.limit, {
      source,
      requestId: "load-" + requestId
    })
      .then((records) => {
        if (this._sleepLoadRequestId !== requestId) {
          console.log("[sleep-detail:load:stale]", { requestId });
          return;
        }
        const normalizedRecords = Array.isArray(records) ? records : [];
        console.log("[sleep-detail:load:result]", normalizedRecords);
        console.log("[sleep-detail:load:records]", {
          records: normalizedRecords,
          returnedDates: normalizedRecords.map((item) => item.recordDate)
        });
        this.applySleepView(normalizedRecords, source);
        this.setData({
          loadError: ""
        });
        console.log("[perf:sleep-load]", {
          source,
          requestId,
          step: "load-success",
          durationMs: Date.now() - startedAt,
          recordCount: normalizedRecords.length
        });
      })
      .catch((error) => {
        if (this._sleepLoadRequestId !== requestId) {
          console.log("[sleep-detail:load:stale]", { requestId, phase: "catch" });
          return;
        }
        console.error("[sleep-detail:load:error]", {
          message: error && error.message,
          code: error && error.code,
          statusCode: error && error.statusCode,
          data: error && error.data,
          fullError: error
        });
        if (!loadOptions.preserveOnError) {
          this.currentSleepRecords = [];
          this.setData({ hasRecord: false, sleep: this.data.copy.noRecord });
          this.setData({ loadError: this.data.copy.loadFailed });
        }
        console.log("[perf:sleep-load]", {
          source,
          requestId,
          step: "load-error",
          durationMs: Date.now() - startedAt
        });
        throw error;
      })
      .finally(() => {
        if (this._sleepLoadRequestId === requestId) {
          this.setData({ loading: false }, () => {
            console.log("[perf:sleep-load]", {
              source,
              requestId,
              step: "load-finally",
              durationMs: Date.now() - startedAt
            });
          });
        }
      });
  },
  changeRange(event) {
    const mode = event.currentTarget.dataset.mode;
    if (!mode || mode === this.data.rangeMode) return;
    this.setData({ rangeMode: mode }, () => this.loadSleepRecord({ source: "changeRange" }));
  },
  moveRange(event) {
    const direction = Number(event.currentTarget.dataset.direction);
    if (direction > 0 && !this.data.canMoveNext) return;
    const amount = this.data.rangeMode === "month" ? 30 : this.data.rangeMode === "week" ? 7 : 1;
    const anchor = new Date(this.data.anchorDateKey + "T12:00:00");
    anchor.setDate(anchor.getDate() + direction * amount);
    const todayKey = dailyCheckins.toDateKey();
    const nextKey = dailyCheckins.toDateKey(anchor) > todayKey ? todayKey : dailyCheckins.toDateKey(anchor);
    this.setData({ anchorDateKey: nextKey }, () => this.loadSleepRecord({ source: "moveRange" }));
  },
  formatRange(trend) {
    if (!trend || trend.from === trend.to) return i18n.formatDateKey(trend ? trend.to : this.data.anchorDateKey);
    return i18n.formatDateKey(trend.from) + " — " + i18n.formatDateKey(trend.to);
  },
  getFocusedSleep(trend, copy) {
    if (!trend || !trend.hasRecords) return copy.noRecord;
    if (this.data.rangeMode !== "day") return trend.averageSleep;
    const point = trend.points[trend.points.length - 1];
    return point && point.duration ? point.duration : copy.noRecord;
  },
  retryLoad() {
    this.loadSleepRecord({ source: "retryLoad" });
  },
  resetSleepModalForm(overrides) {
    return Object.assign({
      sleepRecordId: "",
      sleepHours: DEFAULT_SLEEP_HOURS,
      sleepMinutes: DEFAULT_SLEEP_MINUTES,
      isEditingSleepRecord: false,
      sleepRecordLoadError: "",
      isLoadingSleepModalRecord: false,
      isSavingSleepRecord: false
    }, overrides || {});
  },
  openSleepModal() {
    const recordDate = this.data.anchorDateKey;
    this.setData({
      showSleepModal: true,
      sleepRecordDate: recordDate,
      sleepRecordDateText: formatModalDate(recordDate)
    });
    this.setData(this.resetSleepModalForm(), () => {
      console.log("[sleep-modal:open:state]", {
        sleepRecordDate: this.data.sleepRecordDate,
        sleepRecordId: this.data.sleepRecordId,
        sleepHours: this.data.sleepHours,
        sleepMinutes: this.data.sleepMinutes,
        isEditingSleepRecord: this.data.isEditingSleepRecord,
        isLoadingSleepModalRecord: this.data.isLoadingSleepModalRecord,
        isSavingSleepRecord: this.data.isSavingSleepRecord,
        sleepRecordLoadError: this.data.sleepRecordLoadError
      });
    });
    this.loadSleepModalRecord(recordDate);
  },
  closeSleepModal() {
    if (!this.data.isSavingSleepRecord) {
      this.setData({
        showSleepModal: false,
        isLoadingSleepModalRecord: false,
        isSavingSleepRecord: false,
        sleepRecordLoadError: ""
      });
    }
  },
  stopPropagation() {},
  preventTouchMove() {},
  handleSleepDateChange(event) {
    const recordDate = event.detail.value;
    this.setData({
      sleepRecordDate: recordDate,
      sleepRecordDateText: formatModalDate(recordDate)
    });
    this.setData(this.resetSleepModalForm());
    this.loadSleepModalRecord(recordDate);
  },
  handleSleepHoursInput(event) {
    this.setData({ sleepHours: sanitizeHoursInput(event.detail.value) });
  },
  handleSleepMinutesInput(event) {
    this.setData({ sleepMinutes: sanitizeMinutesInput(event.detail.value, this.data.sleepHours) });
  },
  normalizeSleepHours() {
    const hours = sanitizeHoursInput(this.data.sleepHours);
    this.setData({
      sleepHours: hours,
      sleepMinutes: sanitizeMinutesInput(this.data.sleepMinutes, hours)
    });
  },
  normalizeSleepMinutes() {
    this.setData({
      sleepMinutes: sanitizeMinutesInput(this.data.sleepMinutes, this.data.sleepHours)
    });
  },
  async loadSleepModalRecord(recordDate) {
    const startedAt = Date.now();
    const normalizedDate = String(recordDate || this.data.sleepRecordDate || "");
    const baseUrl = sleepRecords.getSleepApiBaseUrl ? sleepRecords.getSleepApiBaseUrl() : "";
    this._sleepModalLoadSeq = (this._sleepModalLoadSeq || 0) + 1;
    const requestId = this._sleepModalLoadSeq;
    console.log("[sleep-modal:load:start]", {
      recordDate: normalizedDate,
      url: baseUrl + "/api/sleep-records?from=" + normalizedDate + "&to=" + normalizedDate + "&limit=1",
      requestId,
      isSavingSleepRecord: this.data.isSavingSleepRecord,
      sleepHours: this.data.sleepHours,
      sleepMinutes: this.data.sleepMinutes
    });
    this.setData(this.resetSleepModalForm({
      isLoadingSleepModalRecord: true
    }));
    try {
      const records = await sleepRecords.listByDate(normalizedDate, {
        source: "sleep-modal-load",
        requestId: "modal-load-" + requestId
      });
      if (this._sleepModalLoadSeq !== requestId) {
        console.log("[sleep-modal:load:stale]", {
          requestId,
          phase: "success"
        });
        return null;
      }
      const record = Array.isArray(records) && records.length ? records[0] : null;
      console.log("[sleep-modal:load:success]", {
        record
      });
      if (!record) {
        this.setData({
          sleepRecordId: "",
          isEditingSleepRecord: false,
          sleepHours: DEFAULT_SLEEP_HOURS,
          sleepMinutes: DEFAULT_SLEEP_MINUTES,
          sleepRecordLoadError: ""
        });
        console.log("[perf:sleep-modal-load]", {
          step: "no-record",
          recordDate: normalizedDate,
          durationMs: Date.now() - startedAt
        });
        return null;
      }
      this.setData({
        sleepRecordId: record.id || "",
        isEditingSleepRecord: true,
        sleepHours: String(record.sleepHours),
        sleepMinutes: String(record.sleepMinutes),
        sleepRecordLoadError: ""
      });
      console.log("[perf:sleep-modal-load]", {
        step: "load-record-success",
        recordDate: normalizedDate,
        durationMs: Date.now() - startedAt
      });
      return record;
    } catch (error) {
      if (this._sleepModalLoadSeq !== requestId) {
        console.log("[sleep-modal:load:stale]", {
          requestId,
          phase: "error"
        });
        return null;
      }
      console.error("[sleep-modal:load:error]", {
        message: error && error.message,
        code: error && error.code,
        statusCode: error && error.statusCode,
        data: error && error.data,
        fullError: error
      });
      this.setData(this.resetSleepModalForm({
        sleepRecordLoadError: this.data.copy.modalLoadFailed
      }));
      console.log("[perf:sleep-modal-load]", {
        step: "load-record-error",
        recordDate: normalizedDate,
        durationMs: Date.now() - startedAt
      });
      return null;
    } finally {
      if (this._sleepModalLoadSeq === requestId) {
        this.setData({
          isLoadingSleepModalRecord: false
        }, () => {
          console.log("[sleep-modal:load:finally]", {
            requestId,
            isLoadingSleepModalRecord: this.data.isLoadingSleepModalRecord,
            isSavingSleepRecord: this.data.isSavingSleepRecord,
            sleepHours: this.data.sleepHours,
            sleepMinutes: this.data.sleepMinutes
          });
        });
      }
    }
  },
  async saveSleepRecord() {
    const saveStartedAt = Date.now();
    const saveRequestId = "save-" + Date.now();
    console.log("[sleep-modal:save:tap]", {
      isSavingSleepRecord: this.data.isSavingSleepRecord,
      disabled: this.data.isSavingSleepRecord
    });
    if (this.data.isSavingSleepRecord) return;
    const recordDate = this.data.sleepRecordDate;
    const hoursText = String(this.data.sleepHours || "").trim();
    const minutesText = String(this.data.sleepMinutes || "").trim();
    const hours = Number(hoursText);
    const minutes = minutesText === "" ? 0 : Number(minutesText);
    console.log("[sleep-detail:save:start]", {
      requestId: saveRequestId,
      recordDate,
      sleepHours: this.data.sleepHours,
      sleepMinutes: this.data.sleepMinutes,
      recordId: this.data.sleepRecordId,
      isEditing: this.data.isEditingSleepRecord
    });
    console.log("[perf:sleep-save]", {
      requestId: saveRequestId,
      source: "saveSleepRecord",
      phase: "start",
      step: "validation-start",
      durationMs: Date.now() - saveStartedAt
    });
    if (!recordDate) {
      wx.showToast({ title: this.data.copy.modalInvalidDate, icon: "none" });
      return;
    }
    if (hoursText === "") {
      wx.showToast({ title: "请输入睡眠小时", icon: "none" });
      return;
    }
    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 24 ||
      minutes < 0 ||
      minutes > 59 ||
      (hours === 24 && minutes > 0)
    ) {
      wx.showToast({ title: this.data.copy.modalInvalidDuration, icon: "none" });
      return;
    }
    const sleepDurationMinutes = hours * 60 + minutes;
    if (!sleepDurationMinutes || sleepDurationMinutes > 1440) {
      wx.showToast({ title: this.data.copy.modalInvalidDuration, icon: "none" });
      return;
    }

    const payload = {
      recordDate,
      sleepDurationMinutes,
      sleepHours: hours,
      sleepMinutes: minutes
    };
    const method = this.data.isEditingSleepRecord && this.data.sleepRecordId ? "PUT" : "POST";
    const baseUrl = sleepRecords.getSleepApiBaseUrl ? sleepRecords.getSleepApiBaseUrl() : "";
    const url = method === "PUT"
      ? baseUrl + "/api/sleep-records/" + encodeURIComponent(this.data.sleepRecordId)
      : baseUrl + "/api/sleep-records";
    console.log("[sleep-detail:save:request]", {
      requestId: saveRequestId,
      method,
      url,
      payload,
      recordId: this.data.sleepRecordId,
      isEditing: this.data.isEditingSleepRecord
    });
    console.log("[perf:sleep-save]", {
      requestId: saveRequestId,
      source: "saveSleepRecord",
      step: "validation-done",
      durationMs: Date.now() - saveStartedAt
    });
    this.setData({
      isSavingSleepRecord: true,
      sleepHours: String(hours),
      sleepMinutes: String(minutes)
    });
    try {
      const requestStartedAt = Date.now();
      const record = await (this.data.isEditingSleepRecord && this.data.sleepRecordId
        ? sleepRecords.update(this.data.sleepRecordId, payload, {
          source: "sleep-save-put",
          requestId: saveRequestId + "-put"
        })
        : sleepRecords.create(payload, {
          source: "sleep-save-post",
          requestId: saveRequestId + "-post"
        }));
      console.log("[perf:sleep-save]", {
        requestId: saveRequestId,
        source: "saveSleepRecord",
        phase: "save-response",
        step: method + " request",
        durationMs: Date.now() - requestStartedAt,
        totalDurationMs: Date.now() - saveStartedAt
      });
      console.log("[sleep-detail:save:success]", {
        requestId: saveRequestId,
        result: record,
        recordDate,
        sleepDurationMinutes,
        sleepHours: hours,
        sleepMinutes: minutes
      });
      const savedRecord = record || payload;
      const savedRecords = upsertSleepRecord(this.currentSleepRecords, savedRecord);
      this.applySleepView(savedRecords, "save-local");
      this.setData({
        anchorDateKey: recordDate,
        showSleepModal: false,
        loadError: "",
        sleepRecordId: savedRecord && savedRecord.id ? savedRecord.id : "",
        isEditingSleepRecord: Boolean(savedRecord && savedRecord.id),
        sleepRecordDateText: formatModalDate(recordDate),
        sleepHours: String(savedRecord.sleepHours),
        sleepMinutes: String(savedRecord.sleepMinutes),
        isSavingSleepRecord: false
      });
      wx.showToast({ title: this.data.copy.modalSaved, icon: "success" });
      console.log("[perf:sleep-save]", {
        requestId: saveRequestId,
        source: "saveSleepRecord",
        phase: "ui-updated",
        step: "ui-updated-and-modal-closed",
        durationMs: Date.now() - saveStartedAt
      });
      console.log("[sleep-detail:save:reload:start]", {
        requestId: saveRequestId,
        anchorDateKey: this.data.anchorDateKey,
        recordDate
      });
      console.log("[perf:sleep-reload]", {
        requestId: saveRequestId,
        source: "save-success",
        phase: "start",
        durationMs: Date.now() - saveStartedAt
      });
      this.setData({ isRefreshingSleepRecord: true });
      this.loadSleepRecord({
        preserveOnError: true,
        source: "save-success"
      })
        .then(() => {
          console.log("[sleep-detail:date-check]", {
            savedDate: recordDate,
            anchorDateKey: this.data.anchorDateKey,
            returnedDates: Array.isArray(this.currentSleepRecords)
              ? this.currentSleepRecords.map((item) => item.recordDate)
              : []
          });
          console.log("[sleep-detail:save:reload:done]", {
            sleep: this.data.sleep,
            loadError: this.data.loadError,
            hasRecord: this.data.hasRecord
          });
          console.log("[perf:sleep-save]", {
            requestId: saveRequestId,
            source: "saveSleepRecord",
            phase: "reload-response",
            step: "background-reload-finished",
            durationMs: Date.now() - saveStartedAt
          });
          console.log("[perf:sleep-reload]", {
            requestId: saveRequestId,
            source: "save-success",
            phase: "response",
            durationMs: Date.now() - saveStartedAt
          });
        })
        .catch((reloadError) => {
          console.error("[sleep-detail:save:reload:error]", reloadError);
          console.log("[perf:sleep-reload]", {
            requestId: saveRequestId,
            source: "save-success",
            phase: "error",
            durationMs: Date.now() - saveStartedAt
          });
          wx.showToast({
            title: "记录已保存，刷新暂时失败",
            icon: "none"
          });
        })
        .finally(() => {
          this.setData({ isRefreshingSleepRecord: false });
        });
    } catch (error) {
      console.error("[sleep-detail:save:error]", error);
      wx.showToast({ title: this.data.copy.saveFailed, icon: "none" });
    } finally {
      if (this.data.isSavingSleepRecord) {
        this.setData({ isSavingSleepRecord: false });
      }
      console.log("[perf:sleep-save]", {
        requestId: saveRequestId,
        source: "saveSleepRecord",
        phase: "total",
        step: "save-finally",
        durationMs: Date.now() - saveStartedAt
      });
    }
  },
  goBack() {
    wx.navigateBack();
  }
});
