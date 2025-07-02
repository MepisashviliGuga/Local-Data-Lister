// backend/src/notifications.ts
import { Router } from 'express';
import { db } from './db';
import { notifications, users, comments, places } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and, inArray, desc } from 'drizzle-orm';

import logger from './logger';

const router = Router();

router.get('/', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        // Step 1: Try a simple query first
        console.log('Fetching basic notifications for user:', userId);
        
        const basicNotifications = await db.select()
            .from(notifications)
            .where(eq(notifications.recipientId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(10);
        
        console.log('Basic notifications query successful:', basicNotifications.length);
        
        // Step 2: If basic query works, try with joins
        const detailedNotifications = await db.select({
            id: notifications.id,
            recipientId: notifications.recipientId,
            senderId: notifications.senderId,
            commentId: notifications.commentId,
            type: notifications.type,
            isRead: notifications.isRead,
            createdAt: notifications.createdAt,
            // Get sender info
            senderName: users.name,
            senderEmail: users.email,
            // Get comment info
            commentContent: comments.content,
            commentPlaceId: comments.placeId,
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.senderId, users.id))
        .leftJoin(comments, eq(notifications.commentId, comments.id))
        .where(eq(notifications.recipientId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(10);

        res.json(detailedNotifications);
    } catch (error: any) {
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        logger.error(`Error fetching notifications for user ${userId}: ${error.message}`);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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