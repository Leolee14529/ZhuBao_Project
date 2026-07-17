const i18n = require("../../../utils/i18n");

function buildLegend() {
  return ["period", "forecast", "ovulation", "fertile", "safe"].map((key) => ({
    key: key === "forecast" ? "periodForecast" : key,
    label: i18n.t("cycle." + key)
  }));
}

function localizeDetail(detail) {
  if (!detail) return null;
  const statusKey = detail.status === "periodForecast" ? "forecast" : detail.status;
  return Object.assign({}, detail, {
    fullDate: i18n.formatDateKey(detail.dateKey),
    statusLabel: i18n.t("cycle." + statusKey),
    remark: i18n.t("cycle.noRemark")
  });
}

module.exports = { buildLegend, localizeDetail };
