const auth = require("../../../../utils/auth");
const dailyCheckins = require("../../../../utils/daily-checkins");
const i18n = require("../../../../utils/i18n");
const navigation = require("../../../../utils/navigation");
const recordViewModel = require("../../utils/daily-record-view-model");

function emptyRecord(copy) {
  return recordViewModel.buildDailyRecordView(null, copy);
}

function pageState(checkin, loading, loadError, copy) {
  return recordViewModel.buildDailyRecordPageState(checkin, { loading, loadError }, copy);
}

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("data"),
    loading: true,
    loadError: "",
    record: emptyRecord(i18n.getCopy("data")),
    dateKey: dailyCheckins.toDateKey(),
    editorVisible: false,
    editorValue: null,
    saving: false,
    canEdit: false,
    showEmpty: false,
    weeklyLoading: true,
    weeklyError: "",
    weekly: recordViewModel.buildWeeklyRecordView([], dailyCheckins.toDateKey(), i18n.getCopy("data")),
    sleepTrend: recordViewModel.buildSleepTrend([], dailyCheckins.toDateKey(), "week", i18n.getCopy("data")),
    todayFeeling: recordViewModel.buildTodayFeeling(null, i18n.getCopy("data")),
    undoView: recordViewModel.buildUndoView("idle")
  },
  onLoad() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) this.setData({ topSpacer: navLayout.contentOffset });
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
    this.applyLocale();
  },
  onShow() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    this.loadDailyRecord();
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
    if (this.undoTimer) clearTimeout(this.undoTimer);
  },
  applyLocale() {
    const copy = i18n.getCopy("data");
    const state = pageState(this.currentCheckin, this.data.loading, this.data.loadError, copy);
    this.setData({
      copy,
      record: state.record,
      canEdit: state.canEdit,
      showEmpty: state.showEmpty,
      weekly: recordViewModel.buildWeeklyRecordView(this.currentWeekCheckins || [], this.data.dateKey, copy),
      sleepTrend: recordViewModel.buildSleepTrend(this.currentWeekCheckins || [], this.data.dateKey, "week", copy),
      todayFeeling: recordViewModel.buildTodayFeeling(this.currentCheckin, copy)
    });
  },
  loadDailyRecord() {
    const dateKey = dailyCheckins.toDateKey();
    this.setData({ loading: true, loadError: "", dateKey, canEdit: false, showEmpty: false });
    this.loadWeeklyRecords(dateKey);
    dailyCheckins.listByDate(dateKey)
      .then((checkins) => {
        this.currentCheckin = checkins[0] || null;
        const state = pageState(this.currentCheckin, false, "", this.data.copy);
        this.setData({
          loading: false,
          record: state.record,
          canEdit: state.canEdit,
          showEmpty: state.showEmpty,
          todayFeeling: recordViewModel.buildTodayFeeling(this.currentCheckin, this.data.copy)
        });
      })
      .catch((error) => {
        if (error && error.statusCode === 401) {
          this.setData({ loading: false });
          return;
        }
        this.currentCheckin = null;
        const loadError = this.data.copy.loadFailed;
        const state = pageState(null, false, loadError, this.data.copy);
        this.setData({
          loading: false,
          loadError,
          record: state.record,
          canEdit: state.canEdit,
          showEmpty: state.showEmpty,
          todayFeeling: recordViewModel.buildTodayFeeling(null, this.data.copy)
        });
      });
  },
  loadWeeklyRecords(dateKey) {
    const emptyWeek = recordViewModel.buildWeeklyRecordView([], dateKey, this.data.copy);
    this.setData({ weeklyLoading: true, weeklyError: "" });
    dailyCheckins.listRange(emptyWeek.from, emptyWeek.to, 7)
      .then((checkins) => {
        this.currentWeekCheckins = checkins;
        this.setData({
          weeklyLoading: false,
          weekly: recordViewModel.buildWeeklyRecordView(checkins, dateKey, this.data.copy),
          sleepTrend: recordViewModel.buildSleepTrend(checkins, dateKey, "week", this.data.copy)
        });
      })
      .catch((error) => {
        this.currentWeekCheckins = [];
        this.setData({
          weeklyLoading: false,
          weeklyError: error && error.statusCode === 401 ? "" : this.data.copy.weeklyLoadFailed,
          weekly: emptyWeek,
          sleepTrend: recordViewModel.buildSleepTrend([], dateKey, "week", this.data.copy)
        });
      });
  },
  retryWeekly() {
    this.loadWeeklyRecords(this.data.dateKey);
  },
  retryLoad() {
    this.loadDailyRecord();
  },
  openEditor() {
    if (!this.data.canEdit) return;
    this.setData({ editorVisible: true, editorValue: this.currentCheckin || null });
  },
  closeEditor() {
    if (!this.data.saving) this.setData({ editorVisible: false });
  },
  handleEditorInvalid() {
    wx.showToast({ title: this.data.copy.formInvalid, icon: "none" });
  },
  saveRecord(event) {
    if (this.data.saving) return;
    this.setData({ saving: true });
    dailyCheckins.save(event.detail)
      .then((checkin) => {
        this.currentCheckin = checkin;
        this.clearUndoState();
        this.setData({
          saving: false,
          editorVisible: false,
          editorValue: checkin,
          record: recordViewModel.buildDailyRecordView(checkin, this.data.copy),
          canEdit: true,
          showEmpty: false,
          todayFeeling: recordViewModel.buildTodayFeeling(checkin, this.data.copy)
        });
        this.loadWeeklyRecords(this.data.dateKey);
        wx.showToast({ title: this.data.copy.saved, icon: "success" });
      })
      .catch((error) => {
        this.setData({ saving: false });
        if (error && error.statusCode === 401) return;
        wx.showToast({ title: this.data.copy.saveFailed, icon: "none" });
      });
  },
  deleteRecord() {
    if (!this.currentCheckin) return;
    wx.showModal({
      title: this.data.copy.deleteTitle,
      content: this.data.copy.deleteContent,
      confirmText: this.data.copy.deleteConfirm,
      success: (result) => {
        if (!result.confirm) return;
        const deletedRecord = this.currentCheckin;
        dailyCheckins.remove(this.data.dateKey)
          .then(() => {
            this.deletedRecord = deletedRecord;
            this.currentCheckin = null;
            this.setData({
              record: emptyRecord(this.data.copy),
              canEdit: true,
              showEmpty: true,
              todayFeeling: recordViewModel.buildTodayFeeling(null, this.data.copy)
            });
            this.loadWeeklyRecords(this.data.dateKey);
            this.setUndoStatus("available");
            this.scheduleUndoExpiry();
          })
          .catch((error) => {
            if (error && error.statusCode === 401) return;
            wx.showToast({ title: this.data.copy.deleteFailed, icon: "none" });
          });
      }
    });
  },
  undoDelete() {
    if (!this.deletedRecord || !this.data.undoView.canRetry) return;
    const record = this.deletedRecord;
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.setUndoStatus("restoring");
    dailyCheckins.save(record)
      .then((checkin) => {
        this.currentCheckin = checkin;
        this.clearUndoState();
        this.setData({
          record: recordViewModel.buildDailyRecordView(checkin, this.data.copy),
          canEdit: true,
          showEmpty: false,
          todayFeeling: recordViewModel.buildTodayFeeling(checkin, this.data.copy)
        });
        this.loadWeeklyRecords(this.data.dateKey);
      })
      .catch((error) => {
        this.setUndoStatus("failed");
        this.scheduleUndoExpiry();
        if (error && error.statusCode === 401) return;
        wx.showToast({ title: this.data.copy.undoFailed, icon: "none" });
      });
  },
  setUndoStatus(status) {
    this.setData({ undoView: recordViewModel.buildUndoView(status) });
  },
  clearUndoState() {
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = null;
    this.deletedRecord = null;
    this.setUndoStatus("idle");
  },
  scheduleUndoExpiry() {
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => this.clearUndoState(), 5000);
  },
  goHome() {
    navigation.navigateToPage("/pages/home/index");
  },
  goSettings() {
    navigation.navigateToPage("/subpackage/jewelry/pages/settings/index");
  },
  openPeriodCalendar() {
    if (!auth.requireLogin({ source: "/subpackage/periodCalendar/pages/calendar/index" })) return;
    wx.navigateTo({ url: "/subpackage/periodCalendar/pages/calendar/index" });
  },
  openSleepDetail() {
    wx.navigateTo({ url: "/subpackage/jewelry/pages/sleep-detail/index" });
  }
});
