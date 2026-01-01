import { config } from 'dotenv';
import {Pool} from "pg";
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Optimized for Render free tier - conservative settings
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // Reduced to 5 for Render free tier (limited connections)
    min: 0, // Don't keep idle connections - let them close (Render free tier limitation)
    idleTimeoutMillis: 30000, // Close idle connections after 30s (Render free tier)
    connectionTimeoutMillis: 5000, // 5s timeout - fail fast if can't connect
    allowExitOnIdle: true,
    // SSL settings for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute queries with timeout and logging (optional - for critical queries)
// Use this for queries that might be slow or need timeouts
export const queryWithTimeout = async (text: string, params?: any[], timeoutMs: number = 10000) => {
    const startTime = Date.now();
    try {
        const result = await Promise.race([
            pool.query(text, params),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
            )
        ]) as any;
        
        const duration = Date.now() - startTime;
        if (duration > 1000) {
            console.warn(`Slow query detected: ${duration}ms`, { query: text.substring(0, 100) });
        }
        
        return result;
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`Query error after ${duration}ms`, { 
            error: error.message, 
            query: text.substring(0, 100) 
        });
        throw error;
    }
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
// Proper error handling and logging for database connections
pool.on("connect", (client) => {
    console.log("New database connection established");
});

pool.on("error", (err, client) => {
    console.error("Unexpected database error on idle client", {
        error: err.message,
        stack: err.stack,
        client: client ? 'client exists' : 'no client'
    });
});

pool.on("remove", (client) => {
    console.log("Database connection removed from pool");
});

export default pool;