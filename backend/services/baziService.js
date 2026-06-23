const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/wuxing.json");
const DEFAULT_USER_ID = "default";
const DEFAULT_TIMEZONE_OFFSET = 8;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const SUPPORTED_GENDERS = new Set(["male", "female"]);

// The solar-term and pillar formulas below are extracted and adapted from
// junglesta/BAZI index.html so the same local algorithm can run in Node.js.
const SOLAR_TERMS = [
  { index: 0, longitude: 315, name_cn: "立春", name_en: "Start of Spring", name_pinyin: "Lichun" },
  { index: 1, longitude: 330, name_cn: "雨水", name_en: "Rain Water", name_pinyin: "Yushui" },
  { index: 2, longitude: 345, name_cn: "惊蛰", name_en: "Awakening of Insects", name_pinyin: "Jingzhe" },
  { index: 3, longitude: 0, name_cn: "春分", name_en: "Spring Equinox", name_pinyin: "Chunfen" },
  { index: 4, longitude: 15, name_cn: "清明", name_en: "Clear and Bright", name_pinyin: "Qingming" },
  { index: 5, longitude: 30, name_cn: "谷雨", name_en: "Grain Rain", name_pinyin: "Guyu" },
  { index: 6, longitude: 45, name_cn: "立夏", name_en: "Start of Summer", name_pinyin: "Lixia" },
  { index: 7, longitude: 60, name_cn: "小满", name_en: "Grain Full", name_pinyin: "Xiaoman" },
  { index: 8, longitude: 75, name_cn: "芒种", name_en: "Grain in Ear", name_pinyin: "Mangzhong" },
  { index: 9, longitude: 90, name_cn: "夏至", name_en: "Summer Solstice", name_pinyin: "Xiazhi" },
  { index: 10, longitude: 105, name_cn: "小暑", name_en: "Minor Heat", name_pinyin: "Xiaoshu" },
  { index: 11, longitude: 120, name_cn: "大暑", name_en: "Major Heat", name_pinyin: "Dashu" },
  { index: 12, longitude: 135, name_cn: "立秋", name_en: "Start of Autumn", name_pinyin: "Liqiu" },
  { index: 13, longitude: 150, name_cn: "处暑", name_en: "End of Heat", name_pinyin: "Chushu" },
  { index: 14, longitude: 165, name_cn: "白露", name_en: "White Dew", name_pinyin: "Bailu" },
  { index: 15, longitude: 180, name_cn: "秋分", name_en: "Autumn Equinox", name_pinyin: "Qiufen" },
  { index: 16, longitude: 195, name_cn: "寒露", name_en: "Cold Dew", name_pinyin: "Hanlu" },
  { index: 17, longitude: 210, name_cn: "霜降", name_en: "Frost Descent", name_pinyin: "Shuangjiang" },
  { index: 18, longitude: 225, name_cn: "立冬", name_en: "Start of Winter", name_pinyin: "Lidong" },
  { index: 19, longitude: 240, name_cn: "小雪", name_en: "Minor Snow", name_pinyin: "Xiaoxue" },
  { index: 20, longitude: 255, name_cn: "大雪", name_en: "Major Snow", name_pinyin: "Daxue" },
  { index: 21, longitude: 270, name_cn: "冬至", name_en: "Winter Solstice", name_pinyin: "Dongzhi" },
  { index: 22, longitude: 285, name_cn: "小寒", name_en: "Minor Cold", name_pinyin: "Xiaohan" },
  { index: 23, longitude: 300, name_cn: "大寒", name_en: "Major Cold", name_pinyin: "Dahan" }
];

const HEAVENLY_STEMS = {
  names: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
  pinyin: ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"],
  elements: ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"],
  yinYang: ["Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin", "Yang", "Yin"]
};

const EARTHLY_BRANCHES = {
  names: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
  pinyin: ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"],
  animals: ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"]
};

const BRANCH_ELEMENTS = ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"];
const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"];
const ELEMENT_LABELS = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水"
};

function createBadRequestError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: {
        [DEFAULT_USER_ID]: {
          latest: null
        }
      }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function ensureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      latest: null
    };
  }

  return data.users[userId];
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

function gregorianToJulianDay(year, month, day, hour = 0, minute = 0, second = 0) {
  let adjustedYear = year;
  let adjustedMonth = month;

  if (adjustedMonth <= 2) {
    adjustedYear -= 1;
    adjustedMonth += 12;
  }

  const century = Math.floor(adjustedYear / 100);
  const correction = 2 - century + Math.floor(century / 4);

  return (
    Math.floor(365.25 * (adjustedYear + 4716)) +
    Math.floor(30.6001 * (adjustedMonth + 1)) +
    day +
    correction -
    1524.5 +
    (hour + minute / 60 + second / 3600) / 24
  );
}

function sunLongitude(julianDay) {
  const centuries = (julianDay - 2451545.0) / 36525;
  const meanLongitude = 280.46646 + 36000.76983 * centuries + 0.0003032 * centuries * centuries;
  const meanAnomaly = 357.52911 + 35999.05029 * centuries - 0.0001537 * centuries * centuries;
  const meanAnomalyRadians = (meanAnomaly * Math.PI) / 180;

  const equationCenter =
    (1.914602 - 0.004817 * centuries - 0.000014 * centuries * centuries) * Math.sin(meanAnomalyRadians) +
    (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomalyRadians) +
    0.000289 * Math.sin(3 * meanAnomalyRadians);

  let longitude = meanLongitude + equationCenter;
  longitude -= 0.00569;
  longitude %= 360;

  if (longitude < 0) {
    longitude += 360;
  }

  return longitude;
}

function getSolarTermIndex(longitude) {
  const normalized = Math.round(((longitude + 360) % 360) * 100) / 100;

  for (let index = 0; index < SOLAR_TERMS.length; index += 1) {
    const termStart = SOLAR_TERMS[index].longitude;
    const termEnd = (termStart + 15) % 360;

    if (termStart > termEnd) {
      if (normalized >= termStart || normalized < termEnd) {
        return index;
      }
    } else if (normalized >= termStart && normalized < termEnd) {
      return index;
    }
  }

  return 0;
}

function calculateYearPillar(year, month, solarTermIndex) {
  let effectiveYear = year;

  if (month <= 2 && solarTermIndex >= 21) {
    effectiveYear -= 1;
  }

  const stemIndex = (effectiveYear - 4) % 10;
  const branchIndex = (effectiveYear - 4) % 12;

  return {
    stem: (stemIndex + 10) % 10,
    branch: (branchIndex + 12) % 12
  };
}

function calculateMonthPillar(year, month, solarTermIndex) {
  const monthBranch = (Math.floor(solarTermIndex / 2) + 2) % 12;
  let effectiveYear = year;

  if (month <= 2 && solarTermIndex >= 21) {
    effectiveYear -= 1;
  }

  const yearStem = (((effectiveYear - 4) % 10) + 10) % 10;
  const monthStem = (yearStem * 2 + monthBranch) % 10;

  return {
    stem: (monthStem + 10) % 10,
    branch: (monthBranch + 12) % 12
  };
}

function calculateDayPillar(julianDay) {
  const referenceJulianDay = gregorianToJulianDay(1900, 1, 1, 0, 0, 0);
  const daysSinceReference = Math.floor(julianDay - referenceJulianDay);
  const stemIndex = daysSinceReference % 10;
  const branchIndex = (10 + daysSinceReference) % 12;

  return {
    stem: (stemIndex + 10) % 10,
    branch: (branchIndex + 12) % 12
  };
}

function calculateHourPillar(hour, dayStem) {
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const hourStem = (dayStem * 2 + hourBranch) % 10;

  return {
    stem: (hourStem + 10) % 10,
    branch: (hourBranch + 12) % 12
  };
}

function pillarToText(pillar) {
  return `${HEAVENLY_STEMS.names[pillar.stem]}${EARTHLY_BRANCHES.names[pillar.branch]}`;
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

function saveLatestResult(input) {
  const result = calculateWuxing(input);
  const data = readData();
  const user = ensureUser(data, result.userId);

  user.latest = {
    savedAt: new Date().toISOString(),
    result
  };

  writeData(data);

  return {
    message: "Latest wuxing result saved successfully",
    userId: result.userId,
    savedAt: user.latest.savedAt,
    result
  };
}

function getLatestResult(userId) {
  const data = readData();
  const normalizedUserId = userId || DEFAULT_USER_ID;
  const user = ensureUser(data, normalizedUserId);

  if (!user.latest) {
    throw createBadRequestError("No saved wuxing result found for this user");
  }

  return {
    userId: normalizedUserId,
    savedAt: user.latest.savedAt,
    result: user.latest.result
  };
}

module.exports = {
  calculateWuxing,
  saveLatestResult,
  getLatestResult
};
