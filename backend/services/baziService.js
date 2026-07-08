const DEFAULT_USER_ID = "default";
const DEFAULT_TIMEZONE_OFFSET = 8;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const SUPPORTED_GENDERS = new Set(["male", "female"]);
const {
  SOLAR_TERMS,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENTS,
  ELEMENT_KEYS,
  ELEMENT_LABELS
} = require("./bazi/constants");

const COLOR_STYLE_LABELS = { wood: "翠绿色", fire: "红紫色", earth: "蜜糖色", metal: "银白色", water: "蓝黑色" };
const {
  gregorianToJulianDay,
  sunLongitude,
  getSolarTermIndex,
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar,
  pillarToText
} = require("./bazi/pillars");
function createBadRequestError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}
function validateInput(input) {
  if (!input.birthDate) {
    throw createBadRequestError("birthDate is required");
  }

  if (!input.birthTime) {
    throw createBadRequestError("birthTime is required");
  }

  if (!input.gender) {
    throw createBadRequestError("gender is required");
  }

  if (!DATE_REGEX.test(input.birthDate)) {
    throw createBadRequestError("birthDate must use YYYY-MM-DD format");
  }

  if (!TIME_REGEX.test(input.birthTime)) {
    throw createBadRequestError("birthTime must use HH:mm format");
  }

  if (!SUPPORTED_GENDERS.has(input.gender)) {
    throw createBadRequestError("gender must be male or female");
  }

  const [yearString, monthString, dayString] = input.birthDate.split("-");
  const [hourString, minuteString] = input.birthTime.split(":");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (month < 1 || month > 12) {
    throw createBadRequestError("birthDate month is invalid");
  }

  if (day < 1 || day > 31) {
    throw createBadRequestError("birthDate day is invalid");
  }

  if (hour < 0 || hour > 23) {
    throw createBadRequestError("birthTime hour is invalid");
  }

  if (minute < 0 || minute > 59) {
    throw createBadRequestError("birthTime minute is invalid");
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw createBadRequestError("birthDate is not a valid calendar date");
  }

  return {
    userId: input.userId || DEFAULT_USER_ID,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    gender: input.gender,
    timezoneOffset: DEFAULT_TIMEZONE_OFFSET,
    year,
    month,
    day,
    hour,
    minute
  };
}
function buildRawItem(type, pillar, source) {
  const stemElement = HEAVENLY_STEMS.elements[pillar.stem];
  const branchElement = BRANCH_ELEMENTS[pillar.branch];

  return {
    type,
    source,
    stem: HEAVENLY_STEMS.names[pillar.stem],
    branch: EARTHLY_BRANCHES.names[pillar.branch],
    stemPinyin: HEAVENLY_STEMS.pinyin[pillar.stem],
    branchPinyin: EARTHLY_BRANCHES.pinyin[pillar.branch],
    stemElement,
    branchElement,
    yinYang: HEAVENLY_STEMS.yinYang[pillar.stem],
    animal: EARTHLY_BRANCHES.animals[pillar.branch]
  };
}
function toElementKey(elementName) {
  return elementName.toLowerCase();
}
function calculatePercentages(counts) {
  const total = ELEMENT_KEYS.reduce((sum, key) => sum + counts[key], 0);
  const rawPercentages = ELEMENT_KEYS.map((key) => ({
    key,
    raw: total === 0 ? 0 : (counts[key] / total) * 100,
    base: Math.floor(total === 0 ? 0 : (counts[key] / total) * 100)
  }));

  let assigned = rawPercentages.reduce((sum, item) => sum + item.base, 0);
  let remainder = 100 - assigned;

  [...rawPercentages]
    .sort((left, right) => (right.raw - right.base) - (left.raw - left.base))
    .forEach((item) => {
      if (remainder > 0) {
        item.base += 1;
        remainder -= 1;
      }
    });

  const percentages = {};
  ELEMENT_KEYS.forEach((key) => {
    const item = rawPercentages.find((entry) => entry.key === key);
    percentages[key] = item.base;
  });

  return percentages;
}

function buildAnalysis(dominantKey, gender) {
  const dominantLabel = COLOR_STYLE_LABELS[dominantKey] || "翠绿色";
  const descriptions = {
    wood: `整体风格偏清新舒展，${gender === "female" ? "视觉感受更显灵动" : "视觉感受更显利落"}。`,
    fire: "整体色彩更醒目，适合突出明亮、轻盈的视觉感受。",
    earth: "整体风格更温润踏实，适合呈现沉稳、柔和的层次。",
    metal: "整体线条更清爽，适合呈现利落、通透的质感。",
    water: "整体色彩更冷静，适合呈现柔和、流动的风格。"
  };
  return `${dominantLabel}倾向更明显，${descriptions[dominantKey] || descriptions.water}`;
}

function buildSuggestion(dominantKey) {
  if (dominantKey === "wood") {
    return "适合绿色、青色系珠宝，可优先考虑翡翠、碧玉、绿松石等搭配。";
  }

  if (dominantKey === "fire") {
    return "适合红色、紫红色系珠宝，可优先考虑南红、红玛瑙、石榴石等搭配。";
  }

  if (dominantKey === "earth") {
    return "适合黄色、茶色、暖棕色系珠宝，可优先考虑蜜蜡、黄水晶、琥珀等搭配。";
  }

  if (dominantKey === "metal") {
    return "适合白色、金色系珠宝，可优先考虑珍珠、白水晶、K金、银饰等搭配。";
  }

  return "适合蓝色、黑色系珠宝，可优先考虑海蓝宝、青金石、黑曜石等搭配。";
}

function calculateWuxing(input) {
  const normalized = validateInput(input);

  // The original BAZI page is timezone-aware. Because this API request
  // does not carry a timezone, we calculate in China Standard Time (UTC+8).
  const localDate = new Date(
    normalized.year,
    normalized.month - 1,
    normalized.day,
    normalized.hour,
    normalized.minute,
    0
  );
  const utcDate = new Date(localDate.getTime() - normalized.timezoneOffset * 60 * 60 * 1000);

  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth() + 1;
  const utcDay = utcDate.getUTCDate();
  const utcHour = utcDate.getUTCHours();
  const utcMinute = utcDate.getUTCMinutes();

  const julianDay = gregorianToJulianDay(utcYear, utcMonth, utcDay, utcHour, utcMinute, 0);
  const longitude = sunLongitude(julianDay);
  const solarTermIndex = getSolarTermIndex(longitude);
  const yearPillar = calculateYearPillar(normalized.year, normalized.month, solarTermIndex);
  const monthPillar = calculateMonthPillar(normalized.year, normalized.month, solarTermIndex);
  const dayPillar = calculateDayPillar(julianDay);
  const hourPillar = calculateHourPillar(normalized.hour, dayPillar.stem);

  const rawStems = [
    buildRawItem("year", yearPillar, "stem"),
    buildRawItem("month", monthPillar, "stem"),
    buildRawItem("day", dayPillar, "stem"),
    buildRawItem("hour", hourPillar, "stem")
  ].map((item) => ({
    type: item.type,
    value: item.stem,
    pinyin: item.stemPinyin,
    element: item.stemElement,
    yinYang: item.yinYang
  }));

  const rawBranches = [
    buildRawItem("year", yearPillar, "branch"),
    buildRawItem("month", monthPillar, "branch"),
    buildRawItem("day", dayPillar, "branch"),
    buildRawItem("hour", hourPillar, "branch")
  ].map((item) => ({
    type: item.type,
    value: item.branch,
    pinyin: item.branchPinyin,
    element: item.branchElement,
    animal: item.animal
  }));

  const counts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };

  rawStems.forEach((item) => {
    counts[toElementKey(item.element)] += 1;
  });

  rawBranches.forEach((item) => {
    counts[toElementKey(item.element)] += 1;
  });

  const percentages = calculatePercentages(counts);
  const dominantKey = ELEMENT_KEYS.reduce((currentBest, key) => {
    if (percentages[key] > percentages[currentBest]) {
      return key;
    }
    return currentBest;
  }, ELEMENT_KEYS[0]);

  return {
    userId: normalized.userId,
    birthDate: normalized.birthDate,
    birthTime: normalized.birthTime,
    gender: normalized.gender,
    bazi: {
      year: pillarToText(yearPillar),
      month: pillarToText(monthPillar),
      day: pillarToText(dayPillar),
      hour: pillarToText(hourPillar)
    },
    elements: percentages,
    dominant: ELEMENT_LABELS[dominantKey],
    analysis: buildAnalysis(dominantKey, normalized.gender),
    suggestion: buildSuggestion(dominantKey),
    raw: {
      stems: rawStems,
      branches: rawBranches,
      counts,
      solarTerm: SOLAR_TERMS[solarTermIndex],
      sunLongitude: Number(longitude.toFixed(3)),
      julianDay: Number(julianDay.toFixed(3)),
      timezone: "UTC+8"
    }
  };
}

module.exports = {
  calculateWuxing
};
