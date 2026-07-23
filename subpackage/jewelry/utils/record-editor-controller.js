const dailyCheckins = require("../../../utils/daily-checkins");

function open(page, options) {
  const settings = options || {};
  if (settings.canOpen === false) return false;
  page.setData({
    editorVisible: true,
    editorValue: settings.value || null
  });
  return true;
}

function close(page) {
  if (!page.data.saving) page.setData({ editorVisible: false });
}

function handleInvalid(page, copy) {
  wx.showToast({ title: copy.formInvalid, icon: "none" });
}

function save(page, event, options) {
  const settings = options || {};
  const copy = settings.copy || {};
  if (page.data.saving) return Promise.resolve(null);
  page.setData({ saving: true });
  return dailyCheckins.save(event.detail)
    .then((checkin) => {
      if (typeof settings.onSaved === "function") settings.onSaved(checkin);
      wx.showToast({ title: copy.saved, icon: "success" });
      return checkin;
    })
    .catch((error) => {
      page.setData({ saving: false });
      if (error && error.statusCode === 401) return null;
      wx.showToast({ title: copy.saveFailed, icon: "none" });
      if (typeof settings.onError === "function") settings.onError(error);
      return null;
    });
}

function findByDate(checkins, dateKey) {
  return (Array.isArray(checkins) ? checkins : []).find((item) => item && item.checkinDate === dateKey) || null;
}

module.exports = { open, close, handleInvalid, save, findByDate };
