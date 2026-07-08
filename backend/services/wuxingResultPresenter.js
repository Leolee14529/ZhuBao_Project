const { ELEMENT_LABELS } = require("./bazi/constants");

const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"];

function getDominantKey(elements) {
  const source = elements || {};
  return ELEMENT_KEYS.reduce((bestKey, key) => {
    const bestScore = Number(source[bestKey] || 0);
    const currentScore = Number(source[key] || 0);
    return currentScore > bestScore ? key : bestKey;
  }, ELEMENT_KEYS[0]);
}

function buildSafeAnalysis(dominantKey) {
  const label = ELEMENT_LABELS[dominantKey] || "木";
  return `${label}元素更明显，可作为今日色彩和珠宝风格参考。`;
}

function buildSafeSuggestion(dominantKey) {
  const suggestions = {
    wood: "可参考绿色、青色系珠宝，搭配翡翠、碧玉、绿松石等材质。",
    fire: "可参考红色、紫红色系珠宝，搭配南红、红玛瑙、石榴石等材质。",
    earth: "可参考黄色、茶色、暖棕色系珠宝，搭配蜜蜡、黄水晶、琥珀等材质。",
    metal: "可参考白色、金色系珠宝，搭配珍珠、白水晶、K金、银饰等材质。",
    water: "可参考蓝色、黑色系珠宝，搭配海蓝宝、青金石、黑曜石等材质。"
  };
  return suggestions[dominantKey] || suggestions.wood;
}

function sanitizeWuxingResult(result) {
  const source = result || {};
  const elements = {};
  ELEMENT_KEYS.forEach((key) => {
    elements[key] = Number((source.elements && source.elements[key]) || 0);
  });
  const dominantKey = getDominantKey(elements);

  return {
    userId: source.userId,
    birthDate: source.birthDate,
    birthTime: source.birthTime,
    gender: source.gender,
    elements,
    dominant: ELEMENT_LABELS[dominantKey] || source.dominant || "",
    analysis: buildSafeAnalysis(dominantKey),
    suggestion: buildSafeSuggestion(dominantKey)
  };
}

module.exports = {
  sanitizeWuxingResult
};
