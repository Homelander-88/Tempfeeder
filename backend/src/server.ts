import "dotenv/config";
import pool from "./db/connection";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import winston from "winston";
import {fullRouter} from "./routes/index";

// Simple in-memory cache for Render optimization
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache middleware for GET requests
const cacheMiddleware = (ttl: number = CACHE_TTL) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson.call(this, data);
    };

    next();
  };
};

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'spoonfeeder-backend' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the `console` with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const app = express();
const PORT = process.env.PORT || 5000;

async function testConnection(){
    try{
        const result = await pool.query("SELECT NOW()");
        logger.info("Connected to PostgreSQL database", {
            databaseTime: result.rows[0].now
        });
    }catch(err){
        logger.error("Database connection failed", { error: err });
        process.exit(1); // Exit if database connection fails
    }
}
testConnection();
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));


// Compression
app.use(compression());

// Response time monitoring
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }
  });
  next();
});

// CORS configuration - Allow all localhost ports and production domains
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // React dev server
      'http://localhost:3001', // Alternative port
      'http://localhost:3002', // Alternative port
      'http://localhost:8080', // Another common dev port
      'https://spoonfeeders.vercel.app', // Production Vercel
      'https://spoonfeeder-three.vercel.app', // Alternative Vercel
      'https://tempfeeder.vercel.app', // Temporary Vercel
      process.env.FRONTEND_URL // Environment variable
    ].filter(Boolean); // Remove undefined values

    // Allow localhost origins (for development)
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Reject in production
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing with optimized settings
app.use(express.json({
    limit: '5mb', // Reduced from 10mb for better performance
    strict: true
}));
app.use(express.urlencoded({
    extended: true,
    limit: '5mb'
})); // Limit payload size


// Apply caching to read-heavy endpoints (not auth)
app.use('/api/health', cacheMiddleware(30000)); // Cache health check for 30 seconds
app.use('/api/colleges', cacheMiddleware());
app.use('/api/departments', cacheMiddleware());
app.use('/api/semesters', cacheMiddleware());

app.use("/api", fullRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  logger.warn('404 - Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    logger.info('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  pool.end(() => {
    logger.info('Database connection closed');
    process.exit(0);
  });
});

// Optimize server for production
const server = app.listen(PORT,() => {
    logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        memoryLimit: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        platform: process.platform
    });
});

// Render-specific optimizations
if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    // Render-specific settings for better cold start performance
    server.keepAliveTimeout = 75000; // 75 seconds (Render's timeout)
    server.headersTimeout = 76000;
    server.timeout = 25000; // 25 seconds (Render's request timeout)

    // Limit concurrent connections for Render free tier
    server.maxConnections = 50;

    // Enable TCP keep-alive for persistent connections
    server.on('connection', (socket) => {
        socket.setKeepAlive(true, 60000); // 60 seconds
        socket.setTimeout(25000);
    });

    // Clean up cache periodically to prevent memory bloat
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                cache.delete(key);
            }
        }
        // Force garbage collection hint (V8 optimization)
        if (global.gc) {
            global.gc();
        }
    }, 300000); // Every 5 minutes
}

// Handle server startup errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`, { error: error.message });
  } else {
    logger.error('Server startup error', { error: error.message });
  }
  process.exit(1);
});