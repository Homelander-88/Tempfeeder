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
    // Optimized for Render - Lower connection limits for free tier
    max: process.env.NODE_ENV === 'production' ? 10 : 20, // Reduce for Render free tier
    min: 1, // Keep 1 connection alive
    idleTimeoutMillis: 45000, // Increased for Render's connection limits
    connectionTimeoutMillis: 10000, // Increased timeout for network latency
    allowExitOnIdle: true,
    // SSL settings for production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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