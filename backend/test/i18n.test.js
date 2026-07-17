const assert = require("node:assert/strict");
const test = require("node:test");

const i18n = require("../../utils/i18n");

test("English locale returns its own copy and interpolates named values", () => {
  assert.equal(i18n.t("settings.language", {}, "en-US"), "Language");
  assert.equal(i18n.t("profile.user", { suffix: "123456" }, "en-US"), "User 123456");
});

test("unsupported locales and missing English keys safely fall back to Simplified Chinese", () => {
  assert.equal(i18n.normalizeLocale("fr-FR"), "zh-CN");
  assert.equal(i18n.t("settings.language", {}, "fr-FR"), "语言");
});

test("switching locale persists the choice, notifies open pages, and localizes dates", () => {
  const storage = {};
  const originalWx = global.wx;
  const updates = [];
  global.wx = {
    getStorageSync(key) { return storage[key]; },
    setStorageSync(key, value) { storage[key] = value; }
  };

  const unsubscribe = i18n.subscribe((locale) => updates.push(locale));
  assert.equal(i18n.setLocale("en"), "en-US");
  assert.equal(storage[i18n.LOCALE_STORAGE_KEY], "en-US");
  assert.equal(i18n.getLocale(), "en-US");
  assert.deepEqual(updates, ["en-US"]);
  assert.equal(i18n.formatMonth(2026, 7), "7/2026");
  assert.equal(i18n.formatDateKey("2026-07-16"), "7/16/2026");
  unsubscribe();
  global.wx = originalWx;
});

test("every English translation key has a Simplified Chinese counterpart", () => {
  assert.deepEqual(i18n.getMissingKeys("en-US", "zh-CN"), []);
  assert.deepEqual(i18n.getMissingKeys("zh-CN", "en-US"), []);
});
