const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("backend inspiration and presentation copy stays review-safe", () => {
  const files = [
    "backend/services/inspirationService.js",
    "backend/services/wuxingResultPresenter.js"
  ];
  const prohibited = [
    "占卜",
    "抽签",
    "灵签",
    "算命",
    "命理",
    "运势",
    "吉凶",
    "中吉",
    "小吉",
    "改运",
    "转运",
    "旺财",
    "桃花",
    "疗愈",
    "治愈",
    "治疗",
    "诊断",
    "预测未来",
    "气场",
    "调和气场",
    "增强能量",
    "身心状态稳定",
    "五行色彩",
    "出生资料",
    "元素更明显"
  ];

  for (const file of files) {
    const text = readText(file);
    for (const word of prohibited) {
      assert.equal(text.includes(word), false, `${file} contains prohibited word ${word}`);
    }
  }
});
