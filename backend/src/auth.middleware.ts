import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

//          THE FIX IS HERE vvvv
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    // Even though we return here, we tell TypeScript the function's contract is `void`.
    // This is the standard way to handle it in Express with TypeScript.
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return; 
  }

  const token = bearer.split('Bearer ')[1].trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    req.user = payload;
    next(); // Successfully authenticated, move to the next handler.
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }
};