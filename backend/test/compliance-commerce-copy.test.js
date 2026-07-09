const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("style reference surfaces do not expose sales or pricing copy", () => {
  const files = [
    "pages/home/index.js",
    "pages/home/index.wxml",
    "utils/share.js",
    "subpackage/jewelry/utils/products.js",
    "subpackage/jewelry/pages/products/index.js",
    "subpackage/jewelry/pages/products/index.wxml",
    "subpackage/jewelry/pages/products/index.json",
    "subpackage/jewelry/pages/product-detail/index.js",
    "subpackage/jewelry/pages/product-detail/index.wxml",
    "subpackage/jewelry/pages/product-detail/index.json",
    "subpackage/jewelry/components/product-card/product-card.js",
    "subpackage/jewelry/components/product-card/product-card.wxml",
    "subpackage/jewelry/components/product-card/product-card.wxss"
  ];
  const prohibited = [
    "系列产品",
    "商品",
    "价格",
    "¥",
    "￥",
    "预订",
    "预约",
    "下单",
    "购买",
    "新品",
    "定制",
    "展陈款",
    "查看全部",
    "智能项链",
    "智能耳饰",
    "智能戒指",
    "芯片",
    "传感模块",
    "多点触控",
    "电路板",
    "电路",
    "开运",
    "转运",
    "招财",
    "旺财",
    "疗愈",
    "治愈",
    "治疗",
    "改善健康",
    "功效",
    "保证",
    "必然有效",
    "能量",
    "气场"
  ];

  for (const file of files) {
    const text = readText(file);
    for (const word of prohibited) {
      assert.equal(text.includes(word), false, `${file} contains commerce-sensitive copy ${word}`);
    }
  }
});
