import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Joi from "joi";
import winston from "winston";

/* =========================
   Logger (Console only)
   Render-safe
========================= */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

/* =========================
   Validation Schemas
========================= */
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character",
      "any.required": "Password is required",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

/* =========================
   Register
========================= */
export const register = async (req: Request, res: Response) => {
  let userEmail = "";

  try {
    const { error, value } = registerSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    userEmail = email;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id,email",
      [email, passwordHash]
    );

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error("JWT_SECRET missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { userId: result.rows[0].id, email },
      jwtSecret,
      { expiresIn: "5h" }
    );

    return res.status(201).json({
      message: "User registered",
      user: result.rows[0],
      token,
    });
  } catch (err) {
    logger.error("Registration error", {
      email: userEmail,
      error: err,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   Login
========================= */
export const login = async (req: Request, res: Response) => {
  let userEmail = "";

  try {
    const { error, value } = loginSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    userEmail = email;

    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!passwordMatches) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error("JWT_SECRET missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "5h" }
    );

    return res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    logger.error("Login error", {
      email: userEmail,
      error: err,
      ip: req.ip,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   Forgot Password
========================= */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;

    const userRes = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [userRes.rows[0].id, token, expiresAt]
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

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Spoonfeeder" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your Spoonfeeder password",
      text: `Reset your password: ${resetUrl}`,
      html: `<p><a href="${resetUrl}">Reset Password</a></p>`,
    });

    return res.json({ message: "Reset email sent" });
  } catch (err) {
    logger.error("Forgot password error", { error: err });
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   Reset Password
========================= */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const tokenRes = await pool.query(
      "SELECT user_id, expires_at FROM password_resets WHERE token = $1",
      [token]
    );
    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date(tokenRes.rows[0].expires_at) < new Date()) {
      await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);
      return res.status(400).json({ error: "Token expired" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, tokenRes.rows[0].user_id]
    );

    await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    logger.error("Reset password error", { error: err });
    return res.status(500).json({ error: "Internal server error" });
  }
};
