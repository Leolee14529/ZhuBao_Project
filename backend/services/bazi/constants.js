// Extracted and adapted from junglesta/BAZI for local Node.js calculation.
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

module.exports = {
  SOLAR_TERMS,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENTS,
  ELEMENT_KEYS,
  ELEMENT_LABELS
};
