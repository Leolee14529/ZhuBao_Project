const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const TEST_DIR = path.resolve(__dirname, "..", "test");

function collectTestFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectTestFiles(fullPath, files);
    } else if (entry.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }
  return files;
}

const testFiles = collectTestFiles(TEST_DIR).sort();
const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

process.exit(result.status === null ? 1 : result.status);
