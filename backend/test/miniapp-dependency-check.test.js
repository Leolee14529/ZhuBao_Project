const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "../..");
const { inspectMiniappDependencies } = require("../scripts/lib/miniapp-dependency-check");

function writeFixture(root, files) {
  Object.entries(files).forEach(([relativePath, content]) => {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  });
}

test("active mini-program pages and components have a complete dependency closure", () => {
  assert.deepEqual(inspectMiniappDependencies(projectRoot), []);
});

test("dependency inspection reports a missing JavaScript module before WeChat runtime", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-miniapp-deps-"));
  writeFixture(fixture, {
    "app.json": JSON.stringify({ pages: ["pages/home/index"] }),
    "pages/home/index.js": 'require("../../utils/missing-state");\nPage({});\n',
    "pages/home/index.json": "{}",
    "pages/home/index.wxml": "<view></view>",
    "pages/home/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /utils\/missing-state/);
});

test("main-package pages cannot register a component from a subpackage", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-miniapp-deps-"));
  writeFixture(fixture, {
    "app.json": JSON.stringify({
      pages: ["pages/home/index"],
      subPackages: [{ root: "subpackage/jewelry", pages: ["pages/data/index"] }]
    }),
    "pages/home/index.js": "Page({});\n",
    "pages/home/index.json": JSON.stringify({
      usingComponents: { dock: "/subpackage/jewelry/components/dock/dock" }
    }),
    "pages/home/index.wxml": "<dock></dock>",
    "pages/home/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("main-package page")));
});

test("dependency inspection rejects JavaScript modules outside the project root", (t) => {
  const fixtureParent = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-miniapp-boundary-"));
  const fixture = path.join(fixtureParent, "project");
  t.after(() => fs.rmSync(fixtureParent, { recursive: true, force: true }));
  writeFixture(fixtureParent, {
    "outside.js": "module.exports = {};\n",
    "project/app.json": JSON.stringify({ pages: ["pages/home/index"] }),
    "project/pages/home/index.js": 'require("../../../outside");\nPage({});\n',
    "project/pages/home/index.json": "{}",
    "project/pages/home/index.wxml": "<view></view>",
    "project/pages/home/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("outside project root")));
});

test("dependency inspection rejects component paths outside the project root", (t) => {
  const fixtureParent = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-component-boundary-"));
  const fixture = path.join(fixtureParent, "project");
  t.after(() => fs.rmSync(fixtureParent, { recursive: true, force: true }));
  writeFixture(fixtureParent, {
    "outside/dock.js": "Component({});\n",
    "outside/dock.json": '{"component":true}',
    "outside/dock.wxml": "<view></view>",
    "outside/dock.wxss": "",
    "project/app.json": JSON.stringify({ pages: ["pages/home/index"] }),
    "project/pages/home/index.js": "Page({});\n",
    "project/pages/home/index.json": JSON.stringify({
      usingComponents: { dock: "../../../outside/dock" }
    }),
    "project/pages/home/index.wxml": "<dock></dock>",
    "project/pages/home/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("outside project root")));
});

test("dependency inspection rejects active page paths outside the project root", (t) => {
  const fixtureParent = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-page-boundary-"));
  const fixture = path.join(fixtureParent, "project");
  t.after(() => fs.rmSync(fixtureParent, { recursive: true, force: true }));
  writeFixture(fixtureParent, {
    "project/app.json": JSON.stringify({ pages: ["../outside/index"] }),
    "outside/index.js": "Page({});\n",
    "outside/index.json": "{}",
    "outside/index.wxml": "<view></view>",
    "outside/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("outside project root")));
});

test("dependency inspection rejects symlinks that resolve outside the project root", (t) => {
  const fixtureParent = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-symlink-boundary-"));
  const fixture = path.join(fixtureParent, "project");
  t.after(() => fs.rmSync(fixtureParent, { recursive: true, force: true }));
  writeFixture(fixtureParent, {
    "outside.js": "module.exports = {};\n",
    "project/app.json": JSON.stringify({ pages: ["pages/home/index"] }),
    "project/pages/home/index.js": 'require("../../utils/linked");\nPage({});\n',
    "project/pages/home/index.json": "{}",
    "project/pages/home/index.wxml": "<view></view>",
    "project/pages/home/index.wxss": "",
    "project/utils/.keep": ""
  });
  fs.symlinkSync(path.join(fixtureParent, "outside.js"), path.join(fixture, "utils/linked.js"));

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("outside project root")));
});

test("dependency inspection reports malformed component paths instead of crashing", (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "zhubao-component-config-"));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  writeFixture(fixture, {
    "app.json": JSON.stringify({ pages: ["pages/home/index"] }),
    "pages/home/index.js": "Page({});\n",
    "pages/home/index.json": JSON.stringify({ usingComponents: { dock: 42 } }),
    "pages/home/index.wxml": "<view></view>",
    "pages/home/index.wxss": ""
  });

  const issues = inspectMiniappDependencies(fixture);
  assert.ok(issues.some((issue) => issue.includes("Invalid component path")));
});
