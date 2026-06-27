const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const authRouter = require("./routes/auth");
const fortunesRouter = require("./routes/fortunes");
const usersRouter = require("./routes/users");
const wuxingRouter = require("./routes/wuxing");
const requestContext = require("./middlewares/requestContext");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const { sendSuccess, sendError } = require("./http/responses");
const { checkDatabase } = require("./db/pool");
const { loadConfig } = require("./config/env");

function createCorsOptions(config) {
  return {
    origin(origin, callback) {
      if (!origin || !config.isProduction || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed");
      error.status = 403;
      error.code = "CORS_ORIGIN_DENIED";
      callback(error);
    }
  };
}

function createRateLimiter(limit, message) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler(req, res) {
      return sendError(
        res,
        429,
        "RATE_LIMITED",
        message,
        req.requestId
      );
    }
  });
}

function createApp(config = loadConfig()) {
  const app = express();

  app.disable("x-powered-by");
  if (config.isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(requestContext);
  app.use(helmet());
  app.use(cors(createCorsOptions(config)));
  app.use(express.json({ limit: "64kb" }));

  app.get("/", (req, res) => sendSuccess(res, {
    service: "zhubao-backend",
    status: "running"
  }));

  app.get("/health/live", (req, res) => sendSuccess(res, {
    status: "ok"
  }));

  app.get("/api/health", (req, res) => sendSuccess(res, {
    status: "ok"
  }));

  app.get("/health/ready", async (req, res, next) => {
    try {
      const database = await checkDatabase();
      if (!database.healthy) {
        return sendError(
          res,
          503,
          "DATABASE_UNAVAILABLE",
          "Database is unavailable",
          req.requestId
        );
      }
      return sendSuccess(res, { status: "ready", database });
    } catch (error) {
      return next(error);
    }
  });

  app.use("/api", createRateLimiter(300, "Too many API requests"));
  app.use(
    "/api/auth/wechat-login",
    createRateLimiter(20, "Too many login attempts")
  );
  app.use("/api/auth", authRouter);
  app.use("/api/fortunes", fortunesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/wuxing", wuxingRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
