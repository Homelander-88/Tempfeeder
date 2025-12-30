import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Admin emails - should match the frontend admin emails
const ADMIN_EMAILS = [
  'ruhankb29@gmail.com',
  'prasanthsri542@gmail.com',
  'sunshine.sankum@gmail.com',
  'suganthr09@gmail.com'
];

interface DecodedToken {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as DecodedToken;

    // Check if user's email is in the admin list
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Add user info to request for use in controllers
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
