const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const MAX_LINES = 300;
const EXTENSIONS = new Set([".js", ".wxml", ".wxss"]);
const IGNORED_DIRS = new Set([".git", "node_modules", "miniprogram_npm"]);

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const violations = collectFiles(ROOT)
  .map((filename) => ({
    filename,
    lines: fs.readFileSync(filename, "utf8").split(/\r?\n/).length
  }))
  .filter((item) => item.lines > MAX_LINES)
  .sort((left, right) => right.lines - left.lines);

if (violations.length > 0) {
  console.error(`Files exceeding ${MAX_LINES} lines:`);
  for (const item of violations) {
    console.error(`${item.lines}\t${path.relative(ROOT, item.filename)}`);
  }
  process.exitCode = 1;
} else {
  console.log(`All source files are within ${MAX_LINES} lines.`);
}
