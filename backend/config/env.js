function parsePort(value) {
  const port = Number(value || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
}

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === "production",
    port: parsePort(env.PORT),
    databaseUrl: env.DATABASE_URL || "",
    databaseSsl: env.DATABASE_SSL === "true",
    corsOrigins: parseOrigins(env.CORS_ORIGINS),
    wechatAppId: env.WECHAT_APPID || "",
    wechatSecret: env.WECHAT_SECRET || env.WECHAT_APP_SECRET || ""
  });
}

function validateProductionConfig(config) {
  if (!config.isProduction) {
    return;
  }

  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.wechatAppId) missing.push("WECHAT_APPID");
  if (!config.wechatSecret) missing.push("WECHAT_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}

module.exports = {
  loadConfig,
  validateProductionConfig
};
