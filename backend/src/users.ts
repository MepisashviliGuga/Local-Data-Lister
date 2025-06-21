// backend/src/users.ts
import { Router } from 'express';
import { db } from './db';
import { users, userFavorites, places } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and } from 'drizzle-orm';
import logger from './logger';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users/me - Get current user's profile
router.get('/me', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { id: true, email: true, name: true, createdAt: true },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error: any) {
        logger.error(`Error fetching own profile for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/me - Update current user's profile
router.put('/me', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { name, email, password } = req.body;

    try {
        const updateData: { name?: string; email?: string; passwordHash?: string } = {};

        if (name) updateData.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existing = await db.query.users.findFirst({
                where: and(eq(users.email, email), eq(users.id, userId)),
            });
            if (existing) {
                res.status(409).json({ message: 'Email already in use.' });
                return;
            }
            updateData.email = email;
        }
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No update data provided.' });
            return;
        }

        const updatedUserResult = await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
            });

        res.json({ message: 'Profile updated successfully', user: updatedUserResult[0] });
    } catch (error: any) {
        logger.error(`Error updating profile for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users - Get a list of all users
router.get('/', protect, async (req, res) => {
    try {
        const allUsers = await db.query.users.findMany({
            columns: { id: true, name: true, email: true, createdAt: true },
            orderBy: (users, { asc }) => [asc(users.name)],
        });
        res.json(allUsers);
    } catch (error: any) {
        logger.error(`Error fetching all users: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users/:id - Get a specific user's public profile and favorites
router.get('/:id', protect, async (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
        res.status(400).json({ message: 'Invalid user ID.' });
        return;
    }

    try {
        const userProfile = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
            columns: { id: true, name: true, email: true },
        });

        if (!userProfile) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const userFavoriteEntries = await db.select({ place: places })
            .from(userFavorites)
            .innerJoin(places, eq(userFavorites.placeId, places.id))
            .where(and(eq(userFavorites.userId, targetUserId), eq(userFavorites.isFavorite, true)));
        
        const favorites = userFavoriteEntries.map(entry => entry.place);

        res.json({ user: userProfile, favorites });
    } catch (error: any) {
        logger.error(`Error fetching profile for user ${targetUserId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;