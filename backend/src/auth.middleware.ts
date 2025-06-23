import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from './logger';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

//          THE FIX IS HERE vvvv
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // --- ADD THIS DEBUGGING BLOCK ---
  if (!process.env.JWT_SECRET) {
    logger.error("[FATAL] JWT_SECRET is undefined in protect middleware!");
    // This is a server configuration error, so we send a generic message.
    res.status(500).json({ message: "Server configuration error." });
    return;
  }
  const JWT_SECRET = process.env.JWT_SECRET;
  // --- END DEBUGGING BLOCK ---

  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = bearer.split('Bearer ')[1].trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    req.user = payload;
    next();
  } catch (error) {
    // Add more detailed logging for the actual error
    if (error instanceof jwt.TokenExpiredError) {
        logger.warn(`Token expired for user. Token: ${token}`);
        res.status(401).json({ message: 'Unauthorized: Token has expired' });
    } else {
        logger.error(`Invalid token error: ${(error as Error).message}`);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return;
  }
};