// backend/src/auth.ts
import { Request, Response, Router } from 'express';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from './logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    logger.error("FATAL ERROR: JWT_SECRET is not set in environment variables");
    process.exit(1);
}

// === REGISTER Endpoint ===
router.post('/register', async (req: Request, res: Response) => {
    // ... (no changes in this function)
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    try {
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists.' });
            return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUserResult = await db.insert(users).values({ email, passwordHash }).returning({
            id: users.id,
            email: users.email,
        });
        const newUser = newUserResult[0];
        logger.info(`New user registered: ${newUser.email} (ID: ${newUser.id})`);
        res.status(201).json({ message: 'User created successfully', user: newUser });
        return;
    } catch (error: any) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});

// === LOGIN Endpoint ===
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    try {
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        
        // --- THE CHANGE IS HERE ---
        // Increased token lifetime for easier development.
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '8h' } // Changed from '1h' to '8h'
        );
        
        logger.info(`User logged in: ${user.email} (ID: ${user.id})`);
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email },
        });
        return;

    } catch (error: any) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
});

export default router;