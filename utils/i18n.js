const catalogs = require("./i18n-copy");

const DEFAULT_LOCALE = "zh-CN";
const LOCALE_STORAGE_KEY = "zhubao.locale";
const SUPPORTED_LOCALES = ["zh-CN", "en-US"];
const listeners = [];

function normalizeLocale(locale) {
  if (locale === "en" || locale === "en-US") return "en-US";
  return "zh-CN";
}

function getValue(source, key) {
  return String(key || "").split(".").reduce((value, part) => {
    return value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined;
  }, source);
}

function interpolate(value, params) {
  if (typeof value !== "string") return value;
  return value.replace(/{{\s*([\w.-]+)\s*}}/g, (match, name) => {
    return params && params[name] !== undefined ? String(params[name]) : match;
  });
}

function t(key, params, locale) {
  const preferredLocale = normalizeLocale(locale || getLocale());
  const fallback = getValue(catalogs[DEFAULT_LOCALE], key);
  const value = getValue(catalogs[preferredLocale], key);
  return interpolate(value === undefined ? fallback : value, params) || String(key || "");
}

function getLocale() {
  try {
    if (typeof wx !== "undefined" && wx.getStorageSync) {
      return normalizeLocale(wx.getStorageSync(LOCALE_STORAGE_KEY));
    }
  } catch (error) {
    console.warn("[i18n] read locale failed", error);
  }
  return DEFAULT_LOCALE;
}

function setLocale(locale) {
  const nextLocale = normalizeLocale(locale);
  try {
    if (typeof wx !== "undefined" && wx.setStorageSync) wx.setStorageSync(LOCALE_STORAGE_KEY, nextLocale);
  } catch (error) {
    console.warn("[i18n] save locale failed", error);
  }
  listeners.slice().forEach((listener) => listener(nextLocale));
  return nextLocale;
}

function subscribe(listener) {
  if (typeof listener !== "function") return function () {};
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}

function getCopy(namespace, locale) {
  return getValue(catalogs[normalizeLocale(locale || getLocale())], namespace) || {};
}

function getLeafKeys(source, prefix) {
  return Object.keys(source || {}).reduce((keys, key) => {
    const value = source[key];
    const path = prefix ? prefix + "." + key : key;
    if (value && typeof value === "object" && !Array.isArray(value)) return keys.concat(getLeafKeys(value, path));
    keys.push(path);
    return keys;
  }, []);
}

function getMissingKeys(fromLocale, toLocale) {
  return getLeafKeys(catalogs[normalizeLocale(fromLocale)]).filter((key) => getValue(catalogs[normalizeLocale(toLocale)], key) === undefined);
}

function formatDateKey(dateKey, locale) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return String(dateKey || "");
  return t("cycle.fullDate", { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }, locale);
}

function formatMonth(year, month, locale) {
  return t("cycle.month", { year: Number(year), month: Number(month) }, locale);
}

module.exports = {
  DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, formatDateKey, formatMonth,
  getCopy, getLocale, getMissingKeys, normalizeLocale, setLocale, subscribe, t
};
