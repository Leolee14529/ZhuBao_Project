const fs = require("node:fs");
const path = require("node:path");

const PAGE_EXTENSIONS = [".js", ".json", ".wxml", ".wxss"];
const COMPONENT_EXTENSIONS = [".js", ".json", ".wxml", ".wxss"];

function isInsideProject(projectRoot, candidate) {
  const rootPath = path.resolve(projectRoot);
  const candidatePath = path.resolve(candidate);
  const relative = path.relative(rootPath, candidatePath);
  const lexicallyInside = relative === "" ||
    (!relative.startsWith(".." + path.sep) && !path.isAbsolute(relative));
  if (!lexicallyInside || !fs.existsSync(candidatePath)) return lexicallyInside;
  const realRelative = path.relative(fs.realpathSync(rootPath), fs.realpathSync(candidatePath));
  return realRelative === "" ||
    (!realRelative.startsWith(".." + path.sep) && !path.isAbsolute(realRelative));
}

function readJson(filePath, issues) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    issues.push(`Invalid JSON: ${filePath}`);
    return null;
  }
}

function resolveModule(basePath) {
  const candidates = path.extname(basePath)
    ? [basePath]
    : [basePath + ".js", basePath + ".json", path.join(basePath, "index.js")];
  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
}

function inspectJavaScript(projectRoot, filePath, issues, visited) {
  if (visited.has(filePath) || !fs.existsSync(filePath)) return;
  if (!isInsideProject(projectRoot, filePath)) {
    issues.push(`Module path is outside project root: ${filePath}`);
    return;
  }
  visited.add(filePath);
  const source = fs.readFileSync(filePath, "utf8");
  const requirePattern = /require\(\s*["']([^"']+)["']\s*\)/g;
  let match = requirePattern.exec(source);

  while (match) {
    const request = match[1];
    if (request.startsWith(".")) {
      const requestedPath = path.resolve(path.dirname(filePath), request);
      if (!isInsideProject(projectRoot, requestedPath)) {
        issues.push(`Module path is outside project root: ${requestedPath}`);
      } else {
        const resolved = resolveModule(requestedPath);
        if (!resolved) {
          issues.push(`Missing module ${requestedPath} required by ${filePath}`);
        } else if (!isInsideProject(projectRoot, resolved)) {
          issues.push(`Module path is outside project root: ${resolved}`);
        } else if (path.extname(resolved) === ".js") {
          inspectJavaScript(projectRoot, resolved, issues, visited);
        }
      }
    }
    match = requirePattern.exec(source);
  }
}

function componentBasePath(projectRoot, ownerJson, componentPath) {
  if (componentPath.startsWith("/")) {
    return path.join(projectRoot, componentPath.replace(/^\/+/, ""));
  }
  return path.resolve(path.dirname(ownerJson), componentPath);
}

function inspectComponent(projectRoot, owner, name, componentPath, context) {
  const { issues, visitedComponents, visitedJavaScript, subpackageRoots } = context;
  if (typeof componentPath !== "string" || !componentPath) {
    issues.push(`Invalid component path for ${name} in ${owner.jsonPath}`);
    return;
  }
  if (componentPath.startsWith("plugin://")) return;
  const basePath = componentBasePath(projectRoot, owner.jsonPath, componentPath);

  if (!isInsideProject(projectRoot, basePath)) {
    issues.push(`Component path is outside project root: ${basePath}`);
    return;
  }

  if (owner.mainPackage && subpackageRoots.some((root) => {
    const subpackagePath = path.join(projectRoot, root) + path.sep;
    return basePath.startsWith(subpackagePath);
  })) {
    issues.push(`A main-package page cannot use subpackage component ${componentPath}`);
  }

  if (visitedComponents.has(basePath)) return;
  visitedComponents.add(basePath);
  COMPONENT_EXTENSIONS.forEach((extension) => {
    const filePath = basePath + extension;
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing component file ${filePath}`);
    } else if (!isInsideProject(projectRoot, filePath)) {
      issues.push(`Component path is outside project root: ${filePath}`);
    }
  });

  inspectJavaScript(projectRoot, basePath + ".js", issues, visitedJavaScript);
  const configPath = basePath + ".json";
  if (!fs.existsSync(configPath)) return;
  const config = readJson(configPath, issues);
  inspectUsingComponents(projectRoot, {
    jsonPath: configPath,
    mainPackage: owner.mainPackage
  }, config, context);
}

function inspectUsingComponents(projectRoot, owner, config, context) {
  const components = config && config.usingComponents;
  if (!components || typeof components !== "object") return;
  Object.entries(components).forEach(([name, componentPath]) => {
    inspectComponent(projectRoot, owner, name, componentPath, context);
  });
}

function activePages(appConfig) {
  const pages = (appConfig.pages || []).map((pagePath) => ({
    pagePath,
    mainPackage: true
  }));
  (appConfig.subPackages || appConfig.subpackages || []).forEach((subpackage) => {
    (subpackage.pages || []).forEach((pagePath) => {
      pages.push({
        pagePath: path.posix.join(subpackage.root, pagePath),
        mainPackage: false
      });
    });
  });
  return pages;
}

function inspectPage(projectRoot, page, context) {
  const basePath = path.join(projectRoot, page.pagePath);
  if (!isInsideProject(projectRoot, basePath)) {
    context.issues.push(`Page path is outside project root: ${basePath}`);
    return;
  }
  PAGE_EXTENSIONS.forEach((extension) => {
    const filePath = basePath + extension;
    if (!fs.existsSync(filePath)) {
      context.issues.push(`Missing page file ${filePath}`);
    } else if (!isInsideProject(projectRoot, filePath)) {
      context.issues.push(`Page path is outside project root: ${filePath}`);
    }
  });
  inspectJavaScript(projectRoot, basePath + ".js", context.issues, context.visitedJavaScript);
  const jsonPath = basePath + ".json";
  if (!fs.existsSync(jsonPath)) return;
  const config = readJson(jsonPath, context.issues);
  inspectUsingComponents(projectRoot, {
    jsonPath,
    mainPackage: page.mainPackage
  }, config, context);
}

function inspectMiniappDependencies(projectRoot) {
  const issues = [];
  const appPath = path.join(projectRoot, "app.json");
  if (!fs.existsSync(appPath)) return [`Missing app.json: ${appPath}`];
  const appConfig = readJson(appPath, issues);
  if (!appConfig) return issues;
  const subpackageRoots = (appConfig.subPackages || appConfig.subpackages || [])
    .map((subpackage) => subpackage.root);
  const context = {
    issues,
    subpackageRoots,
    visitedComponents: new Set(),
    visitedJavaScript: new Set()
  };
  activePages(appConfig).forEach((page) => inspectPage(projectRoot, page, context));
  return Array.from(new Set(issues));
}

module.exports = { inspectMiniappDependencies };
