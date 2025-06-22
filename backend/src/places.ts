// backend/src/places.ts
import { Router } from 'express';
import { db } from './db';
import { places, userFavorites, comments } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and } from 'drizzle-orm';
import logger from './logger';

const router = Router();

const findOrCreatePlace = async (placeData: any) => {
    // Use the more stable ID we create on the frontend/in the /nearby endpoint
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
        const favoritePlaces = await db.selectDistinct({place: places}).from(places)
            .innerJoin(userFavorites, eq(places.id, userFavorites.placeId))
            .where(eq(userFavorites.isFavorite, true));
        
        res.json(favoritePlaces.map(p => p.place));
    } catch (error: any) {
        logger.error(`Error fetching community favorites: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// NEW ENDPOINT
// GET /api/places/by-google-id/:googlePlaceId
router.get('/by-google-id/:googlePlaceId', async (req, res) => {
    const { googlePlaceId } = req.params;
    try {
        const place = await db.query.places.findFirst({
            where: eq(places.googlePlaceId, googlePlaceId),
        });

        if (place) {
            const placeComments = await db.query.comments.findMany({
                where: eq(comments.placeId, place.id),
                with: { author: { columns: { email: true } } },
                orderBy: (comments, { desc }) => [desc(comments.createdAt)],
            });
            res.json({ place, comments: placeComments });
            return;
        }
        
        res.status(404).json({ message: 'Place not yet in our database.' });
        return;

    } catch (error: any) {
        logger.error(`Error fetching place by google ID: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/places/me/favorites
router.get('/me/favorites', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const userFavoriteEntries = await db.select({ place: places }).from(userFavorites)
            .innerJoin(places, eq(userFavorites.placeId, places.id))
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.isFavorite, true)));
        res.json(userFavoriteEntries.map(entry => entry.place));
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

// MODIFIED COMMENT ENDPOINT
// POST /api/places/comment
router.post('/comment', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { placeData, content } = req.body;
    if (!content) {
        res.status(400).json({ message: 'Comment content cannot be empty.' });
        return;
    }
    try {
        const place = await findOrCreatePlace(placeData);
        const newCommentResult = await db.insert(comments).values({
            userId,
            placeId: place.id,
            content,
        }).returning();
        
        const newCommentWithAuthor = await db.query.comments.findFirst({
            where: eq(comments.id, newCommentResult[0].id),
            with: { author: { columns: { email: true } } }
        });
        res.status(201).json(newCommentWithAuthor);
    } catch (error: any) {
        logger.error(`Error adding comment: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;