import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const register = async (_req: Request, res: Response) => {
    try {
        const { email, password } = _req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id,email",
            [email, passwordHash]
        );

        const newUser = result.rows[0];
        const jwtsecret = process.env.JWT_SECRET;
        if (!jwtsecret) return res.status(500).json({ error: "Server configuration error" });

        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, jwtsecret, { expiresIn: "5h" });
        return res.status(201).json({ message: "User registered", user: { id: newUser.id, email: newUser.email }, token });
    } catch (err) {
        console.error("register error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const result = await pool.query("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: "Invalid email or password" });

        const existingUser = result.rows[0];
        const passwordMatches = await bcrypt.compare(password, existingUser.password_hash);
        if (!passwordMatches) return res.status(400).json({ error: "Invalid email or password" });

        const jwtsecret = process.env.JWT_SECRET;
        if (!jwtsecret) return res.status(500).json({ error: "Server configuration error" });

        const token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, jwtsecret, { expiresIn: "5h" });
        return res.json({ message: "Login successful", user: { id: existingUser.id, email: existingUser.email }, token });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) {
            // Do not reveal whether email exists
            return res.status(200).json({ message: "If that email exists, a reset link was sent" });
        }

        const userId = userRes.rows[0].id;
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await pool.query(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)",
            [userId, token, expiresAt]
        );

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || "no-reply@example.com",
            to: email,
            subject: "Password reset",
            text: `Click to reset your password: ${resetUrl}`,
            html: `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });

        return res.status(200).json({ message: "If that email exists, a reset link was sent" });
    } catch (err) {
        console.error("forgotPassword error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) return res.status(400).json({ error: "Invalid request" });

        const tokenRes = await pool.query("SELECT user_id, expires_at FROM password_resets WHERE token = $1", [token]);
        if (tokenRes.rows.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

        const { user_id, expires_at } = tokenRes.rows[0];
        if (new Date(expires_at) < new Date()) {
            await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);
            return res.status(400).json({ error: "Token expired" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, user_id]);

        await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);

        const userRes = await pool.query("SELECT id, email FROM users WHERE id = $1", [user_id]);
        const user = userRes.rows[0];
        const jwtsecret = process.env.JWT_SECRET;
        if (!jwtsecret) return res.status(500).json({ error: "Server JWT config missing" });

        const newToken = jwt.sign({ userId: user.id, email: user.email }, jwtsecret, { expiresIn: "5h" });
        return res.json({ message: "Password reset successful", token: newToken });
    } catch (err) {
        console.error("resetPassword error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
