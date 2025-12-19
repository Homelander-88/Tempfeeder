import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  userId: number;
  email: string;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Read the Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1]; // get the part after "Bearer"

  try {
    // 2) Verify the token
    const decoded = jwt.verify(
      token,
      "secret_key_spoon"
    ) as AuthPayload;

    // 3) Attach user info to req for later handlers
    (req as any).user = {
      id: decoded.userId,
      email: decoded.email
    };

    // 4) Continue to the next middleware/route
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};