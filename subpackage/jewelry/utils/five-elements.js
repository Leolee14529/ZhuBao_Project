var STORAGE_KEY = "jewelryBirthProfile";
var auth = require("../../../utils/auth");
var ELEMENT_META = {
  wood: {
    key: "wood",
    cn: "木",
    en: "Wood",
    label: "翠绿色",
    color: "#10b981",
    jade: "翠绿/碧玉",
    suit: "适合呈现舒展、清新的视觉感受"
  },
  fire: {
    key: "fire",
    cn: "火",
    en: "Fire",
    label: "红紫色",
    color: "#f43f5e",
    jade: "红翡/紫罗兰",
    suit: "适合突出明亮、醒目的风格"
  },
  earth: {
    key: "earth",
    cn: "土",
    en: "Earth",
    label: "蜜糖色",
    color: "#d97706",
    jade: "黄翡/蜜糖",
    suit: "适合增加温润、沉稳的层次"
  },
  metal: {
    key: "metal",
    cn: "金",
    en: "Metal",
    label: "银白色",
    color: "#e2e8f0",
    jade: "冰种/白底青",
    suit: "适合呈现清透、利落的质感"
  },
  water: {
    key: "water",
    cn: "水",
    en: "Water",
    label: "蓝黑色",
    color: "#3b82f6",
    jade: "墨翠/蓝水",
    suit: "适合呈现冷静、柔和的色彩感"
  }
};
var ELEMENT_ORDER = ["wood", "fire", "earth", "metal", "water"];
function getDefaultBirthInput() {
  return {
    date: "1998-08-08",
    time: "08:30",
    gender: "female"
  };
}
function normalizeGender(gender) {
  return gender === "male" ? "male" : "female";
}
function normalizeBirthInput(birthInput) {
  var safeInput = birthInput && birthInput.date && birthInput.time ? birthInput : getDefaultBirthInput();
  return {
    date: safeInput.date,
    time: safeInput.time,
    gender: normalizeGender(safeInput.gender)
  };
}
function getSavedBirthInput() {
  var birthInput = auth.getPersonalData(STORAGE_KEY);
  if (!birthInput || !birthInput.date || !birthInput.time) {
    return getDefaultBirthInput();
  }
  return normalizeBirthInput(birthInput);
}
function saveBirthInput(birthInput) {
  auth.setPersonalData(STORAGE_KEY, birthInput);
}
function sanitizeWuxingResult(result) {
  var source = result || {};
  var elements = {};
  ELEMENT_ORDER.forEach(function (key) {
    elements[key] = Number(source.elements && source.elements[key] || 0);
  });
  return {
    userId: source.userId,
    birthDate: source.birthDate,
    birthTime: source.birthTime,
    gender: source.gender,
    elements: elements,
    dominant: source.dominant
  };
}
function saveWuxingResult(result) {
  var safeResult = sanitizeWuxingResult(result);
  auth.setPersonalData(auth.WUXING_KEY, safeResult);
  if (result && result.birthDate && result.birthTime) {
    saveBirthInput({
      date: result.birthDate,
      time: result.birthTime,
      gender: result.gender
    });
  }
}
function getSavedWuxingResult() {
  return auth.getPersonalData(auth.WUXING_KEY) || null;
}
function buildEmptyElements() {
  return ELEMENT_ORDER.map(function (key, index) {
    var meta = ELEMENT_META[key];
    return {
      key: key,
      name: meta.label,
      jade: "暂无参考数据",
      suitable: "0% · 暂无色彩参考数据",
      color: meta.color,
      rowClass: index === ELEMENT_ORDER.length - 1 ? "element-row-last" : ""
    };
  });
}
function buildEmptyProfile(birthInput) {
  return {
    birthInput: birthInput || getDefaultBirthInput(),
    focusElement: "无",
    focusKey: "",
    destinyLine: "暂无色彩参考数据",
    summaryText: "暂无色彩参考数据",
    radarValues: [0, 0, 0, 0, 0],
    radarNote: "暂无色彩参考数据。",
    elements: buildEmptyElements()
  };
}
function buildResultSummary(dominantMeta, weakestMeta) {
  return dominantMeta.label + "倾向更明显，可搭配" + weakestMeta.label + "丰富整体风格层次";
}
function buildProfileFromResult(result) {
  if (!result || !result.elements) return null;
  var ranked = ELEMENT_ORDER.map(function (key) {
    return {
      key: key,
      score: Number(result.elements[key] || 0)
    };
  }).sort(function (left, right) {
    return right.score - left.score;
  });
  var dominantKey = ranked[0].key;
  var weakestKey = ranked[ranked.length - 1].key;
  var dominantMeta = ELEMENT_META[dominantKey];
  var weakestMeta = ELEMENT_META[weakestKey];
  var elements = ranked.map(function (item, index) {
    var meta = ELEMENT_META[item.key];
    return {
      key: item.key,
      name: meta.label,
      jade: meta.jade,
      suitable: item.score + "% · " + meta.suit,
      color: meta.color,
      rowClass: index === ranked.length - 1 ? "element-row-last" : ""
    };
  });
  var radarValues = ELEMENT_ORDER.map(function (key) {
    return Number((0.55 + Number(result.elements[key] || 0) * 0.004).toFixed(2));
  });
  var summary = buildResultSummary(dominantMeta, weakestMeta);
  return {
    birthInput: {
      date: result.birthDate,
      time: result.birthTime,
      gender: result.gender
    },
    focusElement: dominantMeta.label,
    focusKey: dominantKey,
    destinyLine: dominantMeta.label + "倾向更明显 · " + weakestMeta.label + "可作平衡参考",
    summaryText: summary,
    radarValues: radarValues,
    radarNote: summary,
    elements: elements
  };
}
function isResultForBirthInput(result, birthInput) {
  if (!result || !birthInput) return false;
  var safeInput = normalizeBirthInput(birthInput);
  return result.birthDate === safeInput.date &&
    result.birthTime === safeInput.time &&
    normalizeGender(result.gender) === safeInput.gender;
}
function buildProfileForInput(birthInput, options) {
  var opts = options || {};
  var safeInput = normalizeBirthInput(birthInput);
  var result = Object.prototype.hasOwnProperty.call(opts, "result") ?
    opts.result :
    getSavedWuxingResult();
  var serverProfile = isResultForBirthInput(result, safeInput) ?
    buildProfileFromResult(result) :
    null;
  if (serverProfile) return serverProfile;
  if (opts.allowLocalFallback === false) return buildEmptyProfile(safeInput);
  return buildProfile(safeInput);
}
function buildCurrentProfile() {
  return buildProfileFromResult(getSavedWuxingResult()) || buildEmptyProfile(getSavedBirthInput());
}
function buildProfile(birthInput) {
  var safeInput = birthInput && birthInput.date && birthInput.time ? birthInput : getDefaultBirthInput();
  var dateParts = safeInput.date.split("-").map(function (item) {
    return Number(item);
  });
  var timeParts = safeInput.time.split(":").map(function (item) {
    return Number(item);
  });
  var year = dateParts[0] || 1998;
  var month = dateParts[1] || 8;
  var day = dateParts[2] || 8;
  var hour = timeParts[0] || 8;
  var minute = timeParts[1] || 30;
  var scores = [18, 18, 18, 18, 18];
  var seeds = [
    year,
    month * 7 + day,
    hour * 11 + minute,
    year + month + day + hour + minute
  ];
  var seasonIndex = (month + 1) % 5;
  seeds.forEach(function (seed, seedIndex) {
    scores[(seed + seedIndex) % 5] += 10;
    scores[(seed * 2 + seedIndex) % 5] += 6;
    scores[(seed * 3 + seedIndex) % 5] += 4;
  });
  scores[seasonIndex] += 8;
  scores[(seasonIndex + 2) % 5] += 4;
  var highest = Math.max.apply(null, scores);
  var lowest = Math.min.apply(null, scores);
  var spread = highest - lowest || 1;
  var ranked = ELEMENT_ORDER.map(function (key, index) {
    var score = scores[index];
    return {
      key: key,
      score: score,
      value: Number((0.58 + ((score - lowest) / spread) * 0.27).toFixed(2))
    };
  }).sort(function (left, right) {
    return right.score - left.score;
  });
  var dominantKey = ranked[0].key;
  var weakestKey = ranked[ranked.length - 1].key;
  var dominantMeta = ELEMENT_META[dominantKey];
  var weakestMeta = ELEMENT_META[weakestKey];
  var elements = ranked.map(function (item, index) {
    var meta = ELEMENT_META[item.key];
    var suitable = meta.suit;
    if (item.key === dominantKey) {
      suitable = "当前色彩更明显，适合突出视觉感受";
    } else if (item.key === weakestKey) {
      suitable = "当前较少，可作平衡参考";
    }
    return {
      key: item.key,
      name: meta.label,
      jade: meta.jade,
      suitable: suitable,
      color: meta.color,
      rowClass: index === ranked.length - 1 ? "element-row-last" : ""
    };
  });
  var radarValues = ELEMENT_ORDER.map(function (key) {
    var current = null;
    ranked.forEach(function (item) {
      if (item.key === key) {
        current = item;
      }
    });
    return current ? current.value : 0.65;
  });
  var note = "整体色彩分布较均衡。";
  if (highest - lowest >= 10) {
    note = dominantMeta.label + "倾向更明显，" + weakestMeta.label + "可作平衡参考，可用" + weakestMeta.jade + "丰富整体风格层次。";
  }
  return {
    birthInput: safeInput,
    focusElement: dominantMeta.label,
    focusKey: dominantKey,
    destinyLine: dominantMeta.label + "倾向更明显 · " + weakestMeta.label + "可作平衡参考",
    summaryText: "风格资料已保存，可查看色彩偏好与珠宝风格参考",
    radarValues: radarValues,
    radarNote: note,
    elements: elements
  };
}
module.exports = {
  STORAGE_KEY: STORAGE_KEY, ELEMENT_META: ELEMENT_META, ELEMENT_ORDER: ELEMENT_ORDER,
  getDefaultBirthInput: getDefaultBirthInput, getSavedBirthInput: getSavedBirthInput,
  saveBirthInput: saveBirthInput, saveWuxingResult: saveWuxingResult,
  getSavedWuxingResult: getSavedWuxingResult, normalizeBirthInput: normalizeBirthInput,
  isResultForBirthInput: isResultForBirthInput, buildEmptyProfile: buildEmptyProfile,
  buildProfileFromResult: buildProfileFromResult, buildProfileForInput: buildProfileForInput,
  buildCurrentProfile: buildCurrentProfile, sanitizeWuxingResult: sanitizeWuxingResult,
  buildProfile: buildProfile
};
