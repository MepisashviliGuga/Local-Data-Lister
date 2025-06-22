import { Router } from 'express';
import { db } from './db';
import { places, userFavorites, comments } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, and, sql } from 'drizzle-orm';
import logger from './logger';

const router = Router();

// Helper function to find or create a place in our database
// This prevents duplicate entries for the same location.
const findOrCreatePlace = async (placeData: any) => {
    const googlePlaceId = `${placeData.location.latitude},${placeData.location.longitude}`;
    
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
            latitude: placeData.location.latitude.toString(),
            longitude: placeData.location.longitude.toString(),
        }).returning();
        place = newPlaceResult[0];
    }
    
    return place;
};

// --- PUBLIC ROUTES ---

// GET /api/places/community-favorites
// Gets all places that have been favorited by at least one person.
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


// GET /api/places/:id
// Gets details for a single place, including its comments.
router.get('/:id', async (req, res) => {
    const placeId = parseInt(req.params.id);
    try {
        const place = await db.query.places.findFirst({
            where: eq(places.id, placeId),
        });

        if (!place) {
            res.status(404).json({ message: 'Place not found' });
            return;
        }

        const placeComments = await db.query.comments.findMany({
            where: eq(comments.placeId, placeId),
            with: {
                author: {
                    columns: { email: true }
                }
            },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        });

        res.json({ place, comments: placeComments });
    } catch (error: any) {
        logger.error(`Error fetching place details: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- PROTECTED ROUTES (require login) ---

// GET /api/places/me/favorites
// Gets all places the current logged-in user has favorited.
router.get('/me/favorites', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const userFavoriteEntries = await db.select({ place: places }).from(userFavorites)
            .innerJoin(places, eq(userFavorites.placeId, places.id))
            .where(and(
                eq(userFavorites.userId, userId),
                eq(userFavorites.isFavorite, true)
            ));

        res.json(userFavoriteEntries.map(entry => entry.place));
    } catch (error: any) {
        logger.error(`Error fetching user favorites: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});


// POST /api/places/favorite
// Lets a user favorite/unfavorite and rate a place.
router.post('/favorite', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { placeData, isFavorite, rating } = req.body;

    try {
        const place = await findOrCreatePlace(placeData);

        // Upsert logic: Update if exists, otherwise insert.
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

// POST /api/places/:id/comments
// Adds a new comment to a place.
router.post('/:id/comments', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const placeId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ message: 'Comment content cannot be empty.' });
        return;
    }

    try {
        const newCommentResult = await db.insert(comments).values({
            userId,
            placeId,
            content,
        }).returning();
        
        // Fetch the comment again to include author details
        const newCommentWithAuthor = await db.query.comments.findFirst({
            where: eq(comments.id, newCommentResult[0].id),
            with: {
                author: { columns: { email: true }}
            }
        });

        res.status(201).json(newCommentWithAuthor);
    } catch (error: any) {
        logger.error(`Error adding comment: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;