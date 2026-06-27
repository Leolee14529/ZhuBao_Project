const crypto = require("crypto");

const FORTUNES = [
  {
    id: "fortune-088",
    no: "NO.88",
    symbol: "巽",
    title: "中吉",
    subtitle: "Wind / Wood",
    text: "风行水上，自然成纹。今日灵感如风，宜顺势而为。指环监测显示心流状态极佳。"
  },
  {
    id: "fortune-021",
    no: "NO.21",
    symbol: "离",
    title: "小吉",
    subtitle: "Fire / Light",
    text: "明火照玉，纹理自显。今日宜整理思路，把已经成形的想法清楚表达。"
  },
  {
    id: "fortune-046",
    no: "NO.46",
    symbol: "坤",
    title: "平",
    subtitle: "Earth / Field",
    text: "厚土藏珍，不急于显。今日适合稳住节奏，为后续成事留足余地。"
  },
  {
    id: "fortune-063",
    no: "NO.63",
    symbol: "兑",
    title: "吉",
    subtitle: "Lake / Metal",
    text: "泽中有光，言语生辉。今日宜沟通协作，以柔和姿态换得更顺的回应。"
  },
  {
    id: "fortune-075",
    no: "NO.75",
    symbol: "坎",
    title: "小吉",
    subtitle: "Water / Flow",
    text: "静水映月，暗流有序。今日适合观察局势，在细节里找到新的入口。"
  }
];

function pickIndex(max) {
  if (crypto.randomInt) {
    return crypto.randomInt(max);
  }
  return Math.floor(Math.random() * max);
}

function getRandomFortune(options = {}) {
  const previousId = options.previousId || "";
  const candidates = FORTUNES.filter((item) => item.id !== previousId);
  const pool = candidates.length > 0 ? candidates : FORTUNES;
  return pool[pickIndex(pool.length)];
}

module.exports = {
  getRandomFortune
};
