const auth = require("../../utils/auth");
const request = require("../../utils/request");

function getGuestMoodHeader(getGuestId) {
  return {
    "X-Guest-Id": getGuestId()
  };
}

function getCycleDate(now) {
  const timestamp = now instanceof Date ? now.getTime() :
    (typeof now === "number" ? now : Date.now());
  const beijingDate = new Date(timestamp + 8 * 60 * 60 * 1000);
  if (beijingDate.getUTCHours() < 12) {
    beijingDate.setUTCDate(beijingDate.getUTCDate() - 1);
  }
  return beijingDate.toISOString().slice(0, 10);
}

function fetchToday(options) {
  const requestOptions = options || {};
  const path = requestOptions.path || "/api/mood/today";
  const getGuestId = requestOptions.getGuestId || auth.getMoodGuestId;
  const hasToken = Boolean(auth.getToken());
  return request.request({
    url: path,
    method: "GET",
    header: hasToken ? {} : getGuestMoodHeader(getGuestId),
    redirectOnUnauthorized: false
  }).catch((error) => {
    if (!hasToken || !error || error.statusCode !== 401) throw error;
    auth.clearAuthState();
    return request.request({
      url: path,
      method: "GET",
      header: getGuestMoodHeader(getGuestId),
      includeAuth: false,
      redirectOnUnauthorized: false
    });
  });
}

module.exports = {
  getCycleDate,
  fetchToday
};
