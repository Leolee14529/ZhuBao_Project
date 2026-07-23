const createApp = require("./app");
const { closePool } = require("./db/pool");
const { loadConfig, validateProductionConfig } = require("./config/env");

const config = loadConfig();
validateProductionConfig(config);

const app = createApp(config);
const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`ZhuBao backend listening on port ${config.port}`);
  console.log("[server:listening]", {
    host: "0.0.0.0",
    port: config.port
  });
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down`);
  server.close(async (error) => {
    await closePool();
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
