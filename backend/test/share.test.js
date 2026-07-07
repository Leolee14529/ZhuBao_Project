const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function listRegisteredPages() {
  const appConfig = JSON.parse(readText("app.json"));
  const pages = [...(appConfig.pages || [])];
  for (const subPackage of appConfig.subPackages || appConfig.subpackages || []) {
    const packageRoot = String(subPackage.root || "").replace(/^\/+|\/+$/g, "");
    for (const page of subPackage.pages || []) {
      pages.push(`${packageRoot}/${page}`);
    }
  }
  return pages;
}

test("registered pages support WeChat friend and timeline sharing", () => {
  const shareUtil = readText("utils/share.js");
  assert.ok(shareUtil.includes('"shareAppMessage"'));
  assert.ok(shareUtil.includes('"shareTimeline"'));

  for (const page of listRegisteredPages()) {
    const pageLogic = readText(`${page}.js`);
    const route = `/${page}`;
    assert.ok(pageLogic.includes("share.enableShareMenu()"), `${page} must show the share menu`);
    assert.match(pageLogic, /onShareAppMessage\s*(?:\(|:)/, `${page} must support friend sharing`);
    assert.match(pageLogic, /onShareTimeline\s*(?:\(|:)/, `${page} must support timeline sharing`);
    assert.ok(shareUtil.includes(route), `utils/share.js must configure ${route}`);
  }
});
