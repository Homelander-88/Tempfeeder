import { config } from 'dotenv';
import {Pool} from "pg";
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

// Optimized for Vercel serverless - connection pooling is critical
// Vercel functions are stateless, so we need efficient connection management
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Vercel serverless optimization - smaller pool per function instance
    max: process.env.VERCEL ? 2 : (process.env.NODE_ENV === 'production' ? 5 : 20), // 2 for Vercel (serverless), 5 for traditional prod
    min: 0, // Don't keep idle connections - important for serverless
    idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000, // 10s for Vercel (faster cleanup), 30s for traditional
    connectionTimeoutMillis: 10000, // Increased to 10s - give more time for connection establishment
    allowExitOnIdle: true,
    // SSL settings for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Add keep-alive settings to maintain connection stability
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    // Connection validation
    query_timeout: 15000, // 15s query timeout
    statement_timeout: 15000, // 15s statement timeout
    idle_in_transaction_session_timeout: 30000, // 30s idle transaction timeout
});

// Helper function to execute queries with timeout, retry logic, and logging
export const queryWithTimeout = async (text: string, params?: any[], timeoutMs: number = 15000, retries: number = 2) => {
    const startTime = Date.now();
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await Promise.race([
                pool.query(text, params),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
                )
            ]) as any;

            const duration = Date.now() - startTime;
            if (duration > 1000) {
                console.warn(`Slow query detected: ${duration}ms`, { query: text.substring(0, 100), attempt: attempt + 1 });
            }

            return result;
        } catch (error: any) {
            lastError = error;
            const duration = Date.now() - startTime;

            // Check if this is a connection error that we should retry
            const isRetryableError = error.message.includes('Connection terminated') ||
                                   error.message.includes('connection terminated') ||
                                   error.message.includes('ECONNRESET') ||
                                   error.message.includes('ENOTFOUND') ||
                                   (error as any).code === 'ECONNREFUSED';

            if (isRetryableError && attempt < retries) {
                console.warn(`Database connection error (attempt ${attempt + 1}/${retries + 1}), retrying in 1s...`, {
                    error: error.message,
                    query: text.substring(0, 100)
                });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                continue;
            }

            console.error(`Query failed after ${duration}ms and ${attempt + 1} attempts`, {
                error: error.message,
                code: (error as any).code,
                query: text.substring(0, 100)
            });
            throw error;
        }
    }

    throw lastError;
};

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
// Enhanced error handling and logging for database connections
pool.on("connect", (client) => {
    console.log("✅ New database connection established", {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    });
});

pool.on("error", (err, client) => {
    console.error("❌ Unexpected database error on idle client", {
        error: err.message,
        code: (err as any).code,
        stack: err.stack,
        client: client ? 'client exists' : 'no client',
        poolStats: {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
        }
    });

    // For connection errors, release the problematic client back to pool
    if (client) {
        try {
            client.release(true); // Release with destroy flag
        } catch (releaseError) {
            console.error("Failed to release problematic client", releaseError);
        }
    }
});

pool.on("remove", (client) => {
    console.log("🗑️ Database connection removed from pool", {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    });
});

// Add connection validation on checkout
pool.on("acquire", (client) => {
    // Optional: Add connection health check here if needed
    console.log("🔗 Database connection acquired", {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    });
});

export default pool;