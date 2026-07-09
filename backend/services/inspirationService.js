const crypto = require("crypto");

const INSPIRATIONS = [
  {
    id: "inspiration-01",
    no: "NO.01",
    symbol: "润",
    title: "清润",
    subtitle: "今日色彩 / 青绿色",
    text: "把注意力放回手边的一件小事。慢慢呼吸 6 次。佩戴参考：玉石、银色、柔光金属。"
  },
  {
    id: "inspiration-02",
    no: "NO.02",
    symbol: "明",
    title: "明亮",
    subtitle: "今日色彩 / 暖白色",
    text: "把已经成形的想法写成一句话。慢慢转动手腕 30 秒。佩戴参考：白玉、柔光金属。"
  },
  {
    id: "inspiration-03",
    no: "NO.03",
    symbol: "稳",
    title: "沉稳",
    subtitle: "今日色彩 / 蜜糖色",
    text: "把节奏放慢一点，先完成一件确定的小事。肩颈放松 30 秒。佩戴参考：黄翡、暖金色。"
  },
  {
    id: "inspiration-04",
    no: "NO.04",
    symbol: "柔",
    title: "柔光",
    subtitle: "今日色彩 / 银白色",
    text: "给一句话留出停顿，沟通会更轻松。闭眼呼吸 6 次。佩戴参考：冰种、银色金属。"
  },
  {
    id: "inspiration-05",
    no: "NO.05",
    symbol: "展",
    title: "舒展",
    subtitle: "今日色彩 / 蓝绿色",
    text: "把视线从屏幕移开，看向远处 30 秒。佩戴参考：蓝水、墨翠、冷调金属。"
  }
];

function pickIndex(max) {
  if (crypto.randomInt) {
    return crypto.randomInt(max);
  }
  return Math.floor(Math.random() * max);
}

function getRandomInspiration(options = {}) {
  const previousId = options.previousId || "";
  const candidates = INSPIRATIONS.filter((item) => item.id !== previousId);
  const pool = candidates.length > 0 ? candidates : INSPIRATIONS;
  return pool[pickIndex(pool.length)];
}

module.exports = {
  getRandomInspiration
};
