var STORAGE_KEY = "jewelryBirthProfile";
var auth = require("../../../utils/auth");
var ELEMENT_META = {
  wood: {
    key: "wood",
    cn: "Wood",
    en: "Wood",
    label: "Emerald",
    color: "#10b981",
    jade: "Emerald / Jasper",
    suit: "Good for a calm, fresh visual mood"
  },
  fire: {
    key: "fire",
    cn: "Fire",
    en: "Fire",
    label: "Red Violet",
    color: "#f43f5e",
    jade: "Red Jade / Lavender",
    suit: "Good for a brighter, more expressive style"
  },
  earth: {
    key: "earth",
    cn: "Earth",
    en: "Earth",
    label: "Honey",
    color: "#d97706",
    jade: "Yellow Jade / Honey",
    suit: "Good for adding warmth and grounded layers"
  },
  metal: {
    key: "metal",
    cn: "Metal",
    en: "Metal",
    label: "Silver White",
    color: "#e2e8f0",
    jade: "Icy Jade / Pale Green",
    suit: "Good for a clean, translucent finish"
  },
  water: {
    key: "water",
    cn: "Water",
    en: "Water",
    label: "Blue Black",
    color: "#3b82f6",
    jade: "Dark Jade / Blue Water",
    suit: "Good for a cool, softened color mood"
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
      jade: "No reference data yet",
      suitable: "0% · No color reference data",
      color: meta.color,
      rowClass: index === ELEMENT_ORDER.length - 1 ? "element-row-last" : ""
    };
  });
}
function buildEmptyProfile(birthInput) {
  return {
    birthInput: birthInput || getDefaultBirthInput(),
    focusElement: "None",
    focusKey: "",
    destinyLine: "No color reference data",
    summaryText: "No color reference data",
    radarValues: [0, 0, 0, 0, 0],
    radarNote: "No color reference data.",
    elements: buildEmptyElements()
  };
}
function buildResultSummary(dominantMeta, weakestMeta) {
  return dominantMeta.label + " is more prominent. Add " + weakestMeta.label + " to balance the overall style.";
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
    destinyLine: dominantMeta.label + " stands out · " + weakestMeta.label + " can balance it",
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
      suitable = "This color is more prominent and works well as the visual focus";
    } else if (item.key === weakestKey) {
      suitable = "Use this as a balancing color reference";
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
  var note = "The overall color distribution is balanced.";
  if (highest - lowest >= 10) {
    note = dominantMeta.label + " is more prominent. " + weakestMeta.label + " can balance it; use " + weakestMeta.jade + " to add depth to the overall style.";
  }
  return {
    birthInput: safeInput,
    focusElement: dominantMeta.label,
    focusKey: dominantKey,
    destinyLine: dominantMeta.label + " stands out · " + weakestMeta.label + " can balance it",
    summaryText: "Style details saved. View color preferences and jewelry references.",
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
