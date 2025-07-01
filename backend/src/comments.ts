// backend/src/comments.ts
import { Router } from 'express';
import { db } from './db';
import { commentVotes, comments, notifications } from './db/schema'; // <-- Import comments and notifications
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and } from 'drizzle-orm';
import logger from './logger';
 
const router = Router();

// POST /api/comments/:commentId/vote
router.post('/:commentId/vote', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId; // The person voting
    const commentId = parseInt(req.params.commentId, 10);
    const { value } = req.body; // Expects 1 for upvote, -1 for downvote
 
    if (isNaN(commentId)) {
        res.status(400).json({ message: 'Invalid comment ID.' });
        return;
    }
    if (value !== 1 && value !== -1) {        
        res.status(400).json({ message: 'Invalid vote value. Must be 1 or -1.' });
        return;
    }
 
    try {
        // --- START OF NEW LOGIC ---
        // First, get the comment to find out who the author is.
        const comment = await db.query.comments.findFirst({
            where: eq(comments.id, commentId),
        });
 
        if (!comment) {
            res.status(404).json({ message: 'Comment not found.' });
            return;
        }
        // The person who wrote the comment
        const commentAuthorId = comment.userId;
        // Prevent users from getting notifications for voting on their own comments
        const shouldNotify = userId !== commentAuthorId;
        // --- END OF NEW LOGIC ---
 
        const existingVote = await db.query.commentVotes.findFirst({
            where: and(
                eq(commentVotes.userId, userId),
                eq(commentVotes.commentId, commentId)
            )
        });
 
        let message = '';
        let status = 200;
 
        if (existingVote) {
            if (existingVote.value === value) {
                await db.delete(commentVotes).where(
                    and(
                        eq(commentVotes.userId, userId),
                        eq(commentVotes.commentId, commentId)
                    )
                );
                message = 'Vote removed.';
            } else {
                await db.update(commentVotes).set({ value }).where(
                     and(
                        eq(commentVotes.userId, userId),
                        eq(commentVotes.commentId, commentId)
                    )
                );
                message = 'Vote updated.';
            }
        } else {
            await db.insert(commentVotes).values({
                userId,
                commentId,
                value,
            });
            message = 'Vote cast.';
            status = 201;
        }
        // --- CREATE NOTIFICATION ---
        // We notify only on a new vote or a changed vote, but not on removal.
        if (shouldNotify && message !== 'Vote removed.') {
            await db.insert(notifications).values({
                recipientId: commentAuthorId,
                senderId: userId,
                commentId: commentId,
                type: value === 1 ? 'UPVOTE' : 'DOWNVOTE',
            });
            logger.info(`Notification created for user ${commentAuthorId} from user ${userId} for a vote on comment ${commentId}`);
        }
        // --- END NOTIFICATION LOGIC ---
        res.status(status).json({ message });
        return;
    } catch (error: any) {
        logger.error(`Error casting vote for user ${userId} on comment ${commentId}: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
export default router;