const cycleEngine = require("../../utils/cycle-engine");

function clampNumber(value, min, max) {
  var nextValue = Number(value) || min;
  if (nextValue < min) return min;
  if (nextValue > max) return max;
  return nextValue;
}

function getMonthFromDate(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1
  };
}

function getProfileDate(profile, todayDateKey) {
  return cycleEngine.parseDateKey(profile.lastPeriodDate) ||
    cycleEngine.parseDateKey(todayDateKey) ||
    cycleEngine.getTodayDate();
}

function buildSetupCalendarState(profile, year, month) {
  const normalizedProfile = cycleEngine.normalizeProfile(profile);
  const selectedDateKey = normalizedProfile.lastPeriodDate;
  const built = cycleEngine.buildWeeks(normalizedProfile, year, month, selectedDateKey);
  return {
    setupYear: year,
    setupMonth: month,
    setupMonthLabel: cycleEngine.formatMonthLabel(year, month),
    setupWeeks: built.weeks
  };
}

Component({
  properties: {
    cycleProfile: {
      type: Object,
      value: {}
    },
    todayDateKey: String,
    cyclePrivacyConfirmed: Boolean,
    isSavingCycle: Boolean
  },
  data: {
    ready: false,
    draftProfile: { lastPeriodDate: "", cycleLength: "28", periodLength: "5", todayPeriodStartEnabled: false, adjustments: {} },
    setupYear: 0,
    setupMonth: 0,
    setupMonthLabel: "",
    setupWeeks: [],
    isEditing: false
  },
  lifetimes: {
    attached() {
      this._isAttached = true;
      this.initializeSetup();
    },
    detached() {
      this._isAttached = false;
    }
  },
  observers: {
    "cycleProfile,todayDateKey": function () {
      if (this._isAttached && !this.data.isEditing) this.initializeSetup();
    }
  },
  methods: {
    initializeSetup() {
      const profile = cycleEngine.normalizeProfile(this.properties.cycleProfile || {});
      const setupMonth = getMonthFromDate(getProfileDate(profile, this.properties.todayDateKey));
      this.refreshSetupCalendar(setupMonth.year, setupMonth.month, profile);
    },
    noop() {},
    onCloseTap() {
      this.triggerEvent("close");
    },
    onToggleCyclePrivacy() {
      this.triggerEvent("toggleprivacy");
    },
    refreshSetupCalendar(year, month, profile) {
      const normalizedProfile = cycleEngine.normalizeProfile(profile || this.data.draftProfile);
      this.setData(Object.assign(
        { draftProfile: normalizedProfile, ready: true },
        buildSetupCalendarState(normalizedProfile, year, month)
      ));
    },
    shiftSetupMonth(delta) {
      let { setupYear, setupMonth } = this.data;
      setupMonth += delta;
      if (setupMonth < 1) {
        setupMonth = 12;
        setupYear -= 1;
      }
      if (setupMonth > 12) {
        setupMonth = 1;
        setupYear += 1;
      }
      this.refreshSetupCalendar(setupYear, setupMonth);
    },
    onSetupPrevMonth() { this.shiftSetupMonth(-1); },
    onSetupNextMonth() { this.shiftSetupMonth(1); },
    onSetupSelectDay(event) {
      const { dateKey } = event.detail;
      const selectedDate = cycleEngine.parseDateKey(dateKey);
      const todayKey = this.properties.todayDateKey || cycleEngine.formatDateKey(cycleEngine.getTodayDate());
      const todayDate = cycleEngine.parseDateKey(todayKey);
      if (!selectedDate) return;
      if (cycleEngine.diffDays(selectedDate, todayDate) < 0) {
        wx.showToast({ title: "不能选择今天之后的日期", icon: "none" });
        return;
      }
      const month = getMonthFromDate(selectedDate);
      const nextProfile = cycleEngine.normalizeProfile(Object.assign({}, this.data.draftProfile, {
        lastPeriodDate: dateKey,
        todayPeriodStartEnabled: dateKey === todayKey ? this.data.draftProfile.todayPeriodStartEnabled : false,
        adjustments: dateKey === this.data.draftProfile.lastPeriodDate ? this.data.draftProfile.adjustments : {}
      }));
      this.setData({ isEditing: true });
      this.refreshSetupCalendar(month.year, month.month, nextProfile);
    },
    updateCycleNumber(field, delta, min, max) {
      const currentValue = Number(this.data.draftProfile[field]) || min;
      const nextValue = clampNumber(currentValue + delta, min, max);
      const profilePatch = {};
      profilePatch[field] = String(nextValue);
      const nextProfile = cycleEngine.normalizeProfile(Object.assign({}, this.data.draftProfile, profilePatch));
      this.setData({ isEditing: true });
      this.refreshSetupCalendar(this.data.setupYear, this.data.setupMonth, nextProfile);
    },
    onCycleLengthMinus() { this.updateCycleNumber("cycleLength", -1, 21, 35); },
    onCycleLengthPlus() { this.updateCycleNumber("cycleLength", 1, 21, 35); },
    onPeriodLengthMinus() { this.updateCycleNumber("periodLength", -1, 3, 8); },
    onPeriodLengthPlus() { this.updateCycleNumber("periodLength", 1, 3, 8); },
    onSaveTap() {
      if (this.properties.isSavingCycle) return;
      this.triggerEvent("save", { profile: this.data.draftProfile });
    }
  }
});
