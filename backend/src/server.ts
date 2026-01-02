import "dotenv/config";
import pool from "./db/connection";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import winston from "winston";
import path from "path";
import { fullRouter } from "./routes/index";

/* =========================
   Simple in-memory cache
========================= */
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (ttl: number = CACHE_TTL) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method !== "GET") return next();

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };
};

/* =========================
   Winston Logger (Render-safe)
========================= */
const transports: winston.transport[] = [];

// Always log to console (Render / Docker / serverless)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// File logging ONLY in local development
if (process.env.NODE_ENV === "development") {
  transports.push(
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "spoonfeeder-backend" },
  transports,
});

/* =========================
   Express App
========================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   Database check
========================= */
async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    logger.info("Connected to PostgreSQL", {
      databaseTime: result.rows[0].now,
    });
    return true;
  } catch (err) {
    logger.error("Database connection failed", { error: err });
    throw err;
  }
}

/* =========================
   Process-level safety
========================= */
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection", { reason });
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

/* =========================
   Security & performance
========================= */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(compression());

/* =========================
   Slow request logging
========================= */
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn("Slow request", {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        status: res.statusCode,
      });
    }
  });
  next();
});

/* =========================
   Hard request timeout
========================= */
app.use((req, res, next) => {
  const TIMEOUT_MS = 25_000;
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn("Request timeout", {
        method: req.method,
        url: req.url,
      });
      res.status(504).json({ error: "Request timeout" });
    }
  }, TIMEOUT_MS);

  res.on("finish", () => clearTimeout(timer));
  res.on("close", () => clearTimeout(timer));
  next();
});

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);

      const allowed = [
        "https://spoonfeeders.vercel.app",
        "https://spoonfeeder-three.vercel.app",
        "https://tempfeeder.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      return allowed.includes(origin)
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   Body parsing
========================= */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/* =========================
   Cached routes
========================= */
app.use("/api/health", cacheMiddleware(30_000));
app.use("/api/colleges", cacheMiddleware());
app.use("/api/departments", cacheMiddleware());
app.use("/api/semesters", cacheMiddleware());

app.use("/api", fullRouter);

/* =========================
   Errors & 404
========================= */
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    url: req.url,
  });
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  logger.warn("404 Not Found", { url: req.url });
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   Graceful shutdown
========================= */
const shutdown = () => {
  logger.info("Shutting down gracefully");
  pool.end(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* =========================
   Start server
========================= */
async function startServer() {
  try {
    await testConnection();

    const server = app.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        env: process.env.NODE_ENV || "development",
        node: process.version,
      });
    });

    if (process.env.RENDER || process.env.NODE_ENV === "production") {
      server.keepAliveTimeout = 75_000;
      server.headersTimeout = 76_000;
      server.timeout = 25_000;
      server.maxConnections = 25;
    }
  } catch (err) {
    logger.error("Startup failed", { err });
    process.exit(1);
  }
}

startServer();
