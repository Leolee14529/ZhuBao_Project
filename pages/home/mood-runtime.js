const auth = require("../../utils/auth");
const request = require("../../utils/request");

function normalizeHexColor(color, fallback) {
  const value = typeof color === "string" ? color.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function colorToRgba(color, alpha, fallback) {
  const value = typeof color === "string" ? color.trim() : "";
  const match = value.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return fallback;
  const hex = match[1];
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function normalizeMood(rawMood, defaultMood) {
  const mood = rawMood || {};
  return {
    mood_id: mood.mood_id || mood.id || defaultMood.mood_id,
    name: mood.name || defaultMood.name,
    description: mood.description || defaultMood.description,
    tag: mood.tag || defaultMood.tag,
    emoji: mood.emoji || defaultMood.emoji,
    theme_color: normalizeHexColor(mood.theme_color, defaultMood.theme_color),
    bg_color: normalizeHexColor(mood.bg_color, defaultMood.bg_color),
    text_color: normalizeHexColor(mood.text_color, defaultMood.text_color),
    icon_url: mood.icon_url || "",
    background_url: mood.background_url || "",
    background_mood: mood.background_mood || defaultMood.background_mood,
    encouragement: mood.encouragement || defaultMood.encouragement,
    date: mood.date || "",
    updated_at: mood.updated_at || "",
    generated_at: mood.generated_at || ""
  };
}

function buildView(rawMood, defaultMood) {
  const mood = normalizeMood(rawMood, defaultMood);
  const accent = mood.theme_color;
  const accentSoft = colorToRgba(accent, 0.16, "rgba(57, 216, 122, 0.16)");
  const accentFaint = colorToRgba(accent, 0.09, "rgba(57, 216, 122, 0.09)");
  const bgFaint = colorToRgba(mood.bg_color, 0.08, "rgba(57, 216, 122, 0.08)");

  return {
    mood,
    moodCardStyle: `border-color: ${accentSoft}; background: linear-gradient(135deg, ${bgFaint}, transparent 64%), linear-gradient(180deg, rgba(23, 25, 32, .96), rgba(12, 17, 15, .94));`,
    moodColorCardStyle: `border-color: ${accentSoft}; background: linear-gradient(135deg, ${accentFaint}, transparent 62%), #171920;`,
    moodAccentStyle: `color: ${accent};`,
    moodDotStyle: `background-color: ${accent}; box-shadow: 0 0 16rpx ${accentSoft};`,
    moodTagStyle: `color: ${accent}; border-color: ${accentSoft}; background-color: ${accentFaint};`,
    colorSwatchStyle: `background-color: ${accent}; box-shadow: 0 10rpx 26rpx ${accentSoft};`,
    moodColorTitle: mood.background_mood || (mood.tag ? mood.tag + " Color" : "Today's Color"),
    moodColorDesc: "Synced with today's mood"
  };
}

function getGuestMoodHeader(getGuestId) {
  const guestId = getGuestId();
  return guestId ? { "X-Guest-Id": guestId } : null;
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

function skippedResult(owner) {
  return { data: null, owner, skipped: true };
}

function requestMood(path, header, includeAuth, owner) {
  return request.request({
    url: path,
    method: "GET",
    header,
    includeAuth,
    redirectOnUnauthorized: false
  }).then((data) => ({ data, owner, skipped: false }));
}

function fetchToday(options) {
  const requestOptions = options || {};
  const path = requestOptions.path || "/api/mood/today";
  const getGuestId = requestOptions.getGuestId || auth.getMoodGuestId;
  const hasToken = Boolean(auth.getToken());
  const owner = auth.getPersonalOwner();
  if (!hasToken && !auth.hasPrivacyConsent()) {
    return Promise.resolve(skippedResult(owner));
  }

  const header = hasToken ? {} : getGuestMoodHeader(getGuestId);
  if (!hasToken && !header) return Promise.resolve(skippedResult(owner));
  return requestMood(path, header, hasToken, owner).catch((error) => {
    if (!hasToken || !error || error.statusCode !== 401) throw error;
    auth.invalidateAuthenticatedSession();
    const guestOwner = auth.getPersonalOwner();
    if (!auth.hasPrivacyConsent()) return skippedResult(guestOwner);

    const guestHeader = getGuestMoodHeader(getGuestId);
    if (!guestHeader) return skippedResult(guestOwner);
    return requestMood(path, guestHeader, false, guestOwner);
  });
}

module.exports = {
  buildView,
  getCycleDate,
  fetchToday
};
