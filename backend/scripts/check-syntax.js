const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function collectJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

const failed = [];

for (const file of collectJsFiles(ROOT)) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failed.push({ file, output: result.stderr || result.stdout });
  }
}

if (failed.length > 0) {
  console.error("JavaScript syntax check failed:");
  failed.forEach((item) => {
    console.error(path.relative(ROOT, item.file));
    console.error(item.output);
  });
  process.exit(1);
}

console.log("JavaScript syntax check passed.");
