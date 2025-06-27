// backend/src/notifications.ts
import { Router } from 'express';
import { db } from './db';
import { notifications, comments, places } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and, inArray } from 'drizzle-orm';
import logger from './logger';

const router = Router();

// GET /api/notifications - Get all notifications for the current user
router.get('/', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const userNotifications = await db.query.notifications.findMany({
            where: eq(notifications.recipientId, userId),
            with: {
                sender: { columns: { id: true, name: true, email: true } },
                comment: { with: { place: true } } // Nest place data within comment
            },
            orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
            limit: 50,
        });

        res.json(userNotifications);
    } catch (error: any) {
        logger.error(`Error fetching notifications for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/notifications/mark-read - Mark specific notifications as read
router.post('/mark-read', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { ids } = req.body; // Expect an array of notification IDs

    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ message: 'Notification IDs must be a non-empty array.' });
        return;
    }

    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.recipientId, userId),
                inArray(notifications.id, ids)
            ));
        
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error: any) {
        logger.error(`Error marking notifications as read for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;