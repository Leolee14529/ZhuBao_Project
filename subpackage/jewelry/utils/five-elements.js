var STORAGE_KEY = "jewelryBirthProfile";

var ELEMENT_META = {
  wood: {
    key: "wood",
    cn: "木",
    en: "Wood",
    color: "#10b981",
    jade: "翠绿/碧玉",
    suit: "适合增强成长与舒展能量"
  },
  fire: {
    key: "fire",
    cn: "火",
    en: "Fire",
    color: "#f43f5e",
    jade: "红翡/紫罗兰",
    suit: "适合提升热情与行动表现"
  },
  earth: {
    key: "earth",
    cn: "土",
    en: "Earth",
    color: "#d97706",
    jade: "黄翡/蜜糖",
    suit: "适合加强稳定与承载气场"
  },
  metal: {
    key: "metal",
    cn: "金",
    en: "Metal",
    color: "#e2e8f0",
    jade: "冰种/白底青",
    suit: "适合强化决断与清透气质"
  },
  water: {
    key: "water",
    cn: "水",
    en: "Water",
    color: "#3b82f6",
    jade: "墨翠/蓝水",
    suit: "适合沉静思考与灵感流动"
  }
};

var ELEMENT_ORDER = ["wood", "fire", "earth", "metal", "water"];

function getDefaultBirthInput() {
  return {
    date: "1998-08-08",
    time: "08:30"
  };
}

function getSavedBirthInput() {
  var birthInput = wx.getStorageSync(STORAGE_KEY);
  if (!birthInput || !birthInput.date || !birthInput.time) {
    return getDefaultBirthInput();
  }
  return birthInput;
}

function saveBirthInput(birthInput) {
  wx.setStorageSync(STORAGE_KEY, birthInput);
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
      suitable = "当前主势，适合继续增强优势";
    } else if (item.key === weakestKey) {
      suitable = "当前偏弱，建议重点补足平衡";
    }

    return {
      key: item.key,
      name: meta.cn + " (" + meta.en + ")",
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

  var note = "当前状态：五行能量分布均衡，身心状态稳定。";
  if (highest - lowest >= 10) {
    note = "当前状态：" + dominantMeta.cn + "偏旺，" + weakestMeta.cn + "偏弱，建议佩戴" + weakestMeta.jade + "调和气场。";
  }

  return {
    birthInput: safeInput,
    focusElement: dominantMeta.cn,
    focusKey: dominantKey,
    destinyLine: dominantMeta.cn + "势偏强 · " + weakestMeta.cn + "需补足",
    summaryText: "出生时间已录入，可按命理偏向查看五行分布",
    radarValues: radarValues,
    radarNote: note,
    elements: elements
  };
}

module.exports = {
  STORAGE_KEY: STORAGE_KEY,
  ELEMENT_META: ELEMENT_META,
  ELEMENT_ORDER: ELEMENT_ORDER,
  getDefaultBirthInput: getDefaultBirthInput,
  getSavedBirthInput: getSavedBirthInput,
  saveBirthInput: saveBirthInput,
  buildProfile: buildProfile
};
