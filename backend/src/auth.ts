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
    process.exit(1); // Exit if the secret is not configured
}

// === REGISTER Endpoint ===
// Path: POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        // 1. Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists.' });
            return;
        }

        // 2. Hash the password for security
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Insert the new user into the database
        const newUserResult = await db.insert(users).values({ 
            email, 
            passwordHash 
        }).returning({
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
// Path: POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        // 1. Find the user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            // Use a generic message to avoid telling attackers which emails are registered
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // 2. Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // 3. Create a JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Token expires in 1 hour
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