import {Request,Response} from "express";
import pool from "../db/connection";

const getHealth = async (_req:Request,res:Response) => {
    try {
        // Test database connectivity
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        const dbLatency = Date.now() - dbStart;

        // Get memory usage
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();

        res.json({
            status: "OK",
            message: "SpoonFeeder is healthy",
            timestamp: new Date().toISOString(),
            uptime: Math.round(uptime),
            database: {
                status: "connected",
                latency_ms: dbLatency
            },
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                external: Math.round(memUsage.external / 1024 / 1024), // MB
                usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
            },
            performance: {
                activeConnections: pool.totalCount,
                idleConnections: pool.idleCount
            },
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: "ERROR",
            message: "Service unhealthy",
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'production' ? undefined : (error instanceof Error ? error.message : 'Unknown error')
        });
    }
};
export {getHealth};