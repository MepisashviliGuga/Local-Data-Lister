// backend/src/places.ts
import { Router } from 'express';
import { db } from './db';
import { places, userFavorites, comments, notifications } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and, isNull, desc } from 'drizzle-orm';
import logger from './logger';
 
const router = Router();
 
// A helper function to transform a DB place record to a DataItem with a nested location object
const transformDbPlaceToDataItem = (place: (typeof places.$inferSelect)) => {
    return {
        ...place,
        location: (place.latitude && place.longitude) ? {
            latitude: parseFloat(place.latitude),
            longitude: parseFloat(place.longitude)
        } : null
    };
};
 
const findOrCreatePlace = async (placeData: any) => {
    const googlePlaceId = placeData.googlePlaceId;
    if (!googlePlaceId) {
        throw new Error("googlePlaceId is required to find or create a place.");
    }
 
    let place = await db.query.places.findFirst({
        where: eq(places.googlePlaceId, googlePlaceId),
    });
 
    if (!place) {
        logger.info(`Place not found in DB. Creating new entry for: ${placeData.name}`);
        const newPlaceResult = await db.insert(places).values({
            googlePlaceId: googlePlaceId,
            name: placeData.name,
            formattedAddress: placeData.formattedAddress,
            websiteUri: placeData.websiteUri,
            types: placeData.types,
            userRatingCount: placeData.userRatingCount,
            rating: placeData.rating,
            latitude: placeData.location?.latitude.toString(),
            longitude: placeData.location?.longitude.toString(),
        }).returning();
        place = newPlaceResult[0];
    }
    return place;
};
 
// GET /api/places/community-favorites
router.get('/community-favorites', async (req, res) => {
    try {
        const favoritePlacesRaw = await db.selectDistinct({place: places}).from(places)
            .innerJoin(userFavorites, eq(places.id, userFavorites.placeId))
            .where(eq(userFavorites.isFavorite, true));
        const favoritePlaces = favoritePlacesRaw.map(p => transformDbPlaceToDataItem(p.place));
        res.json(favoritePlaces);
    } catch (error: any) {
        logger.error(`Error fetching community favorites: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
 
// GET /api/places/by-google-id/:googlePlaceId
router.get('/by-google-id/:googlePlaceId', async (req, res) => {
    const { googlePlaceId } = req.params;
    try {
        const placeFromDb = await db.query.places.findFirst({
            where: eq(places.googlePlaceId, googlePlaceId),
        });
 
        if (!placeFromDb) {
            res.status(404).json({ message: 'Place not yet in our database.' });
            return;
        }
        const place = transformDbPlaceToDataItem(placeFromDb);
 
        // 1. Fetch all comments for the place
        const allComments = await db.query.comments.findMany({
            where: eq(comments.placeId, place.id),
            with: { author: { columns: { id: true, email: true, name: true } } },
            orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        });
 
        // 2. Structure comments into a nested tree
        const commentMap = new Map();
        allComments.forEach((comment: any) => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });
 
        const rootComments: any[] = [];
        allComments.forEach((comment: any) => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });
        // 3. Send the nested structure
        res.json({ place, comments: rootComments });
 
    } catch (error: any) {
        logger.error(`Error fetching place by google ID: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
 
// GET /api/places/me/favorites
router.get('/me/favorites', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const userFavoriteEntriesRaw = await db.select({ place: places }).from(userFavorites)
            .innerJoin(places, eq(userFavorites.placeId, places.id))
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.isFavorite, true)));
 
        const userFavoriteEntries = userFavoriteEntriesRaw.map(entry => transformDbPlaceToDataItem(entry.place));
        res.json(userFavoriteEntries);
    } catch (error: any) {
        logger.error(`Error fetching user favorites: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
// POST /api/places/favorite
router.post('/favorite', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { placeData, isFavorite, rating } = req.body;
    try {
        const place = await findOrCreatePlace(placeData);
        await db.insert(userFavorites).values({
            userId,
            placeId: place.id,
            isFavorite,
            rating,
        }).onConflictDoUpdate({
            target: [userFavorites.userId, userFavorites.placeId],
            set: { isFavorite, rating },
        });
        res.status(200).json({ message: 'Preference updated successfully' });
    } catch (error: any) {
        logger.error(`Error updating favorite: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
// POST /api/places/comment
router.post('/comment', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { placeData, content, parentId } = req.body;
 
    if (!content) {
        res.status(400).json({ message: 'Comment content cannot be empty.' });
        return;
    }
    try {
        const place = await findOrCreatePlace(placeData);
 
        // Insert the new comment
        const newCommentResult = await db.insert(comments).values({
            userId,
            placeId: place.id,
            content,
            parentId, // Can be null for top-level comments
        }).returning();
        const newComment = newCommentResult[0];
 
        // If it's a reply, create a notification
        if (parentId) {
            const parentComment = await db.query.comments.findFirst({
                where: eq(comments.id, parentId)
            });
 
            // Make sure not to notify yourself
            if (parentComment && parentComment.userId !== userId) {
                await db.insert(notifications).values({
                    recipientId: parentComment.userId,
                    senderId: userId,
                    commentId: newComment.id,
                    type: 'REPLY',
                });
            }
        }
 
        // Fetch the new comment with author details to return to the client
        const newCommentWithAuthor = await db.query.comments.findFirst({
            where: eq(comments.id, newComment.id),
            with: { author: { columns: { id: true, email: true, name: true } } }
        });
 
        res.status(201).json(newCommentWithAuthor);
    } catch (error: any) {
        logger.error(`Error adding comment: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});
 
 
export default router;