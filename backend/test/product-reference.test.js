const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("style reference pages and restored images are registered in the mini program", () => {
  const app = JSON.parse(read("app.json"));
  const jewelry = app.subPackages.find((item) => item.root === "subpackage/jewelry");
  const requiredPages = ["pages/products/index", "pages/product-detail/index"];
  const requiredImages = [5, 6, 7].map((number) => path.join(root, `subpackage/jewelry/assets/product-${number}.jpg`));

  requiredPages.forEach((page) => assert.ok(jewelry.pages.includes(page)));
  requiredPages.forEach((page) => ["js", "json", "wxml", "wxss"].forEach((extension) => {
    assert.equal(fs.existsSync(path.join(root, `subpackage/jewelry/${page}.${extension}`)), true);
  }));
  assert.ok(requiredImages.every((image) => fs.existsSync(image)));
});

test("product catalog localizes every card and supports filters plus search", () => {
  const modulePath = path.join(root, "subpackage/jewelry/utils/products.js");
  assert.equal(fs.existsSync(modulePath), true);
  const productData = require(modulePath);
  const zhProducts = productData.getProducts({ locale: "zh-CN" });
  const enProducts = productData.getProducts({ locale: "en-US" });

  assert.equal(zhProducts.length, 7);
  assert.equal(enProducts.length, 7);
  assert.equal(zhProducts[0].id, enProducts[0].id);
  assert.notEqual(zhProducts[0].name, enProducts[0].name);
  assert.ok(enProducts.every((item) => !/[\u4e00-\u9fff]/.test([item.name, item.type, item.desc, item.detail, item.scene].join(" "))));
  assert.ok(productData.getProducts({ locale: "zh-CN", filterId: "ring" }).every((item) => item.filters.includes("ring")));
  assert.deepEqual(productData.getProducts({ locale: "en-US", query: "hexagonal" }).map((item) => item.id), ["hex-collar"]);
});

test("product catalog exposes localized moods and supports independent mood filtering", () => {
  const productData = require(path.join(root, "subpackage/jewelry/utils/products.js"));
  const zhProducts = productData.getProducts({ locale: "zh-CN" });
  const enProducts = productData.getProducts({ locale: "en-US" });

  assert.ok(zhProducts.every((item) => item.moodIds.length > 0 && item.moods.length === item.moodIds.length));
  assert.ok(enProducts.every((item) => item.moods.every((label) => !/[\u4e00-\u9fff]/.test(label))));
  assert.ok(productData.getProducts({ locale: "zh-CN", moodId: "calm" }).every((item) => item.moodIds.includes("calm")));
  assert.ok(productData.getProducts({ locale: "en-US", filterId: "ring", moodId: "focused" }).every((item) => item.filters.includes("ring") && item.moodIds.includes("focused")));
});

test("style library has a separate accessible mood selector", () => {
  const listLogic = read("subpackage/jewelry/pages/products/index.js");
  const listView = read("subpackage/jewelry/pages/products/index.wxml");
  const listStyle = read("subpackage/jewelry/pages/products/index.wxss");

  assert.ok(listLogic.includes("activeMood"));
  assert.ok(listLogic.includes("selectMood(event)"));
  assert.ok(listView.includes("copy.moodFilterTitle"));
  assert.ok(listView.includes('bindtap="selectMood"'));
  assert.match(listStyle, /\.mood-pill\s*\{[^}]*min-height:\s*88rpx/);
});

test("the dark-jade work uses two separate detail images", () => {
  const productData = require(path.join(root, "subpackage/jewelry/utils/products.js"));
  const product = productData.getProductById("dark-jade-chip", "zh-CN");

  assert.deepEqual(product.images, [
    "/subpackage/jewelry/assets/product-4-brooch.jpg",
    "/subpackage/jewelry/assets/product-4-ring.jpg"
  ]);
  assert.equal(product.image, product.images[0]);
});

test("detail page swipes multi-image works and links mood reference to the real journal", () => {
  const detailLogic = read("subpackage/jewelry/pages/product-detail/index.js");
  const detailView = read("subpackage/jewelry/pages/product-detail/index.wxml");
  const copy = read("utils/i18n-copy.js");

  assert.ok(detailLogic.includes('require("../../../../utils/auth")'));
  assert.ok(detailLogic.includes("currentImageIndex"));
  assert.ok(detailLogic.includes("changeHeroImage(event)"));
  assert.match(detailLogic, /openDailyRecord\(\)[\s\S]*?auth\.requireLogin\(\{\s*source:[\s\S]*?\/subpackage\/jewelry\/pages\/data\/index/);
  assert.ok(detailView.includes("<swiper"));
  assert.ok(detailView.includes('bindchange="changeHeroImage"'));
  assert.ok(detailView.includes("currentImageIndex + 1"));
  assert.ok(detailView.includes("displayImages.length > 1"));
  assert.ok(detailView.includes("copy.moodReference"));
  assert.ok(detailView.includes('bindtap="openDailyRecord"'));
  assert.match(copy, /recordFeeling:\s*"记录今日感受"/);
  assert.match(copy, /recordFeeling:\s*"Record today's feeling"/);
});

test("home preview, list cards, and detail page form a working image-first route", () => {
  const homeLogic = read("pages/home/index.js");
  const listLogic = read("subpackage/jewelry/pages/products/index.js");
  const listOnLoad = listLogic.slice(listLogic.indexOf("  onLoad()"), listLogic.indexOf("  onUnload()"));
  const homeView = read("pages/home/index.wxml");
  const listView = read("subpackage/jewelry/pages/products/index.wxml");
  const detailView = read("subpackage/jewelry/pages/product-detail/index.wxml");

  assert.ok(homeLogic.includes("openProducts"));
  assert.ok(homeLogic.includes("openProduct"));
  assert.match(homeView, /(?:bind|catch)tap="openProducts"/);
  assert.ok(homeView.includes('bindtap="openProduct"'));
  assert.match(listOnLoad, /^    this\.applyLocale\(\);$/m);
  assert.ok(listView.includes('mode="aspectFill"'));
  assert.ok(listView.includes('lazy-load="true"'));
  assert.ok(listView.includes("copy.featureTitle"));
  assert.ok(detailView.includes('mode="aspectFit"'));
  assert.ok(detailView.includes("copy.colorMaterial"));
  assert.ok(detailView.includes("copy.stylingReference"));
});

test("home style-reference actions use native routes and accessible touch targets", () => {
  const homeLogic = read("pages/home/index.js");
  const listLogic = read("subpackage/jewelry/pages/products/index.js");
  const homeView = read("pages/home/index.wxml");
  const homeStyle = read("pages/home/index.wxss");

  assert.match(homeLogic, /openProducts\(\)\s*\{\s*wx\.navigateTo\(\{/);
  assert.match(homeLogic, /openProduct\(event\)[\s\S]*?wx\.navigateTo\(\{/);
  assert.match(listLogic, /previewProduct\(event\)[\s\S]*?wx\.navigateTo\(\{/);
  assert.ok(homeView.includes('catchtap="openProducts"'));
  assert.ok(homeView.includes('aria-label="{{copy.moreReferences}}"'));
  assert.match(homeStyle, /\.section-head\s*\{[^}]*min-height:\s*88rpx/);
  assert.match(homeStyle, /\.section-title\s*\{[^}]*line-height:\s*1\.35/);
  assert.match(homeStyle, /\.section-link\s*\{[^}]*min-height:\s*88rpx/);
  assert.match(homeStyle, /\.section-link\s*\{[^}]*font-size:\s*28rpx/);
});

test("home style-reference gallery renders every source photo as its own masonry card", () => {
  const homeLogic = read("pages/home/index.js");
  const homeView = read("pages/home/index.wxml");
  const homeStyle = read("pages/home/index.wxss");
  const splitImages = ["product-4-brooch.jpg", "product-4-ring.jpg"];

  assert.match(homeView, /class="product-image"[^>]*mode="widthFix"/);
  assert.match(homeStyle, /\.product-image\s*\{[^}]*width:\s*100%/);
  assert.doesNotMatch(homeStyle, /\.product-image\s*\{[^}]*height:/);
  assert.doesNotMatch(homeStyle, /product-card-portrait/);
  splitImages.forEach((filename) => {
    assert.equal(fs.existsSync(path.join(root, "subpackage/jewelry/assets", filename)), true);
    assert.ok(homeLogic.includes(`/subpackage/jewelry/assets/${filename}`));
  });
  assert.equal((homeLogic.match(/id:\s*"dark-jade-chip"/g) || []).length, 2);
});

test("home style-reference heading aligns to both safe gutter edges", () => {
  const homeStyle = read("pages/home/index.wxss");

  assert.match(homeStyle, /\.section-title\s*\{[^}]*flex:\s*1/);
  assert.match(homeStyle, /\.section-link\s*\{[^}]*flex-shrink:\s*0/);
  assert.match(homeStyle, /\.section-link\s*\{[^}]*padding:\s*0\s+0\s+0\s+28rpx/);
});

test("every product detail image opens the native zoomable preview", () => {
  const detailLogic = read("subpackage/jewelry/pages/product-detail/index.js");
  const detailView = read("subpackage/jewelry/pages/product-detail/index.wxml");
  const detailStyle = read("subpackage/jewelry/pages/product-detail/index.wxss");
  const copy = read("utils/i18n-copy.js");

  assert.match(detailLogic, /previewProductImage\(\)[\s\S]*?wx\.previewImage\(\{/);
  assert.match(detailLogic, /wx\.getImageInfo\(\{/);
  assert.match(detailLogic, /wx\.getFileSystemManager\(\)/);
  assert.match(detailLogic, /wx\.env\.USER_DATA_PATH/);
  assert.match(detailLogic, /writeFile\(\{/);
  assert.match(detailLogic, /current:\s*imagePath/);
  assert.match(detailLogic, /urls:\s*\[imagePath\]/);
  assert.ok(detailView.includes('bindtap="previewProductImage"'));
  assert.ok(detailView.includes('aria-role="button"'));
  assert.ok(detailView.includes('aria-label="{{copy.previewImage}}"'));
  assert.ok(detailView.includes("preview-hint"));
  assert.match(detailStyle, /\.hero-image-wrap\s*\{[^}]*max-height:\s*56vh/);
  assert.match(copy, /previewImage:\s*"点击查看大图"/);
  assert.match(copy, /previewImage:\s*"View full image"/);
});

test("global typography uses a cross-platform system font stack", () => {
  const styles = read("app.wxss");

  assert.match(styles, /-apple-system/);
  assert.match(styles, /"Segoe UI"/);
  assert.match(styles, /"Noto Sans SC"/);
  assert.match(styles, /Arial/);
});

test("bilingual reference layouts stay resilient on narrow and cross-platform screens", () => {
  const listStyle = read("subpackage/jewelry/pages/products/index.wxss");
  const detailStyle = read("subpackage/jewelry/pages/product-detail/index.wxss");

  assert.match(listStyle, /\.mood-filter-head\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(listStyle, /\.mood-filter-hint\s*\{[^}]*margin-left:\s*auto/);
  assert.match(listStyle, /\.product-more\s*\{[^}]*display:\s*inline-flex/);
  assert.doesNotMatch(listStyle, /width:\s*max-content/);
  assert.doesNotMatch(listStyle + detailStyle, /font-weight:\s*650/);
});

test("English detail copy remains concise enough for the same mobile reading rhythm", () => {
  const productData = require(path.join(root, "subpackage/jewelry/utils/products.js"));
  const englishProducts = productData.getProducts({ locale: "en-US" });

  assert.ok(englishProducts.every((item) => item.detail.length <= 165));
});
