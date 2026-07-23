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

function buildAnalysis(dominantKey, percentages, gender) {
  const dominantLabel = ELEMENT_LABELS[dominantKey];

  if (dominantKey === "wood") {
    return `${dominantLabel}元素偏强，整体气质更偏生长与延展，做事有主动性，${gender === "female" ? "风格更显灵动" : "风格更显进取"}。`;
  }

  if (dominantKey === "fire") {
    return `${dominantLabel}元素偏强，整体能量外放，表达力和存在感较强，适合突出个人气场。`;
  }

  if (dominantKey === "earth") {
    return `${dominantLabel}元素较强，整体稳定踏实，重视秩序与安全感，气质偏沉稳。`;
  }

  if (dominantKey === "metal") {
    return `${dominantLabel}元素偏强，判断力和边界感更明显，审美更容易偏向利落与质感。`;
  }

  return `${dominantLabel}元素偏强，整体感受力较细腻，适应变化能力较好，气质偏柔和流动。`;
}

function buildSuggestion(dominantKey) {
  if (dominantKey === "wood") {
    return "适合绿色、青色系珠宝，可优先考虑翡翠、碧玉、绿松石等偏木属性搭配。";
  }

  if (dominantKey === "fire") {
    return "适合红色、紫红色系珠宝，可优先考虑南红、红玛瑙、石榴石等偏火属性搭配。";
  }

  if (dominantKey === "earth") {
    return "适合黄色、茶色、暖棕色系珠宝，可优先考虑蜜蜡、黄水晶、琥珀等偏土属性搭配。";
  }

  if (dominantKey === "metal") {
    return "适合白色、金色系珠宝，可优先考虑珍珠、白水晶、K金、银饰等偏金属性搭配。";
  }

  return "适合蓝色、黑色系珠宝，可优先考虑海蓝宝、青金石、黑曜石等偏水属性搭配。";
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
    analysis: buildAnalysis(dominantKey, percentages, normalized.gender),
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
