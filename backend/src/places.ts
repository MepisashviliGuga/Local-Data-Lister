// backend/src/places.ts
import { Router, Request, Response } from 'express';
import { db } from './db';
import { places, userFavorites, comments } from './db/schema';
import { protect, AuthenticatedRequest } from './auth.middleware';
import { eq, sql, and } from 'drizzle-orm';
import logger from './logger';

const router = Router();

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
            latitude: placeData.latitude?.toString() ?? null,
            longitude: placeData.longitude?.toString() ?? null,
        }).returning();
        place = newPlaceResult[0];
    }
    return place;
};

router.get('/community-favorites', async (req, res) => {
    try {
        console.log('Fetching community favorites...');
        
        // First, check if the tables exist and have data
        const favoritesCount = await db.select({ count: sql`count(*)` })
            .from(userFavorites);
        
        console.log('User favorites count:', favoritesCount);
        
        // Simplified query
        const favorites = await db.select({
            id: places.id,
            name: places.name,
            formattedAddress: places.formattedAddress,
            rating: places.rating,
            googlePlaceId: places.googlePlaceId,
        })
        .from(places)
        .innerJoin(userFavorites, eq(places.id, userFavorites.placeId))
        .where(eq(userFavorites.isFavorite, true))
        .limit(20);

        res.json(favorites);
    } catch (error: any) {
        console.error('Community favorites error:', error);
        console.error('Error message:', error.message);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get('/by-google-id/:googlePlaceId', protect, async (req: AuthenticatedRequest, res) => {
    const { googlePlaceId } = req.params;
    const userId = req.user!.userId;
    try {
        const placeFromDb = await db.query.places.findFirst({
            where: eq(places.googlePlaceId, googlePlaceId),
        });

        if (!placeFromDb) {
            res.json({ place: null, comments: [] });
            return;
        }
        const place = transformDbPlaceToDataItem(placeFromDb);

        // ... rest of the existing code

    } catch (error: any) {
        logger.error(`Error fetching place by google ID: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me/favorites', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    try {
        const userFavoriteEntriesRaw = await db.select({ place: places })
            .from(userFavorites)
            .innerJoin(places, eq(userFavorites.placeId, places.id))
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.isFavorite, true)));

        const userFavoriteEntries = userFavoriteEntriesRaw.map(entry => transformDbPlaceToDataItem(entry.place));
        res.json(userFavoriteEntries);
    } catch (error: any) {
        logger.error(`Error fetching user favorites: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/favorite', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { placeData, isFavorite, rating } = req.body;
    try {
        const place = await findOrCreatePlace(placeData);
        await db.insert(userFavorites).values({
            userId:userId,
            placeId:place.id,
            isFavorite:isFavorite,
            rating:rating
        }).onConflictDoUpdate({
            target: [userFavorites.userId, userFavorites.placeId],
            set: { isFavorite:isFavorite, rating:rating },
        });
        res.status(200).json({ message: 'Preference updated successfully' });
    } catch (error: any) {
        logger.error(`Error updating favorite: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/submit', protect, async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { 
        name, 
        formattedAddress, 
        websiteUrl, // This comes from frontend
        types, 
        rating, 
        latitude, 
        longitude, 
        uniqueGooglePlaceId 
    } = req.body;

    try {
        console.log('🔍 Submitting place with data:', {
            name,
            formattedAddress,
            websiteUrl,
            types,
            rating,
            latitude,
            longitude,
            uniqueGooglePlaceId
        });

        // CRITICAL FIX: Validate uniqueGooglePlaceId before using it
        if (!uniqueGooglePlaceId) {
            console.error('❌ Missing uniqueGooglePlaceId');
            res.status(400).json({ 
                message: 'Google Place ID is required' 
            });
            return;
        }

        console.log('✅ Using Google Place ID:', uniqueGooglePlaceId);

        // Check if place already exists
        const existingPlace = await db.select()
            .from(places)
            .where(eq(places.googlePlaceId, uniqueGooglePlaceId)) // This should work now
            .limit(1);

        if (existingPlace.length > 0) {
            console.log('📍 Place already exists:', existingPlace[0]);
            res.status(409).json({ 
                message: 'Place already exists',
                place: existingPlace[0]
            });
            return;
        }

        // Prepare insert data - MATCH YOUR SCHEMA EXACTLY
        const insertData = {
            name: name || '',
            formattedAddress: formattedAddress || '',
            websiteUri: websiteUrl || null, // Schema uses websiteUri, not websiteUrl
            types: Array.isArray(types) ? types : (types ? [types] : []), // Handle array properly
            userRatingCount: rating ? Number(rating) : null,
            rating: rating ? Number(rating) : null,
            latitude: latitude ? String(latitude) : null, // Schema expects text
            longitude: longitude ? String(longitude) : null, // Schema expects text
            submittedBy: userId,
            googlePlaceId: uniqueGooglePlaceId // CRITICAL: Make sure this matches schema field name
        };

        console.log('🔍 Insert data (corrected):', insertData);

        const newPlaceResult = await db.insert(places)
            .values(insertData)
            .returning();

        console.log('✅ Place inserted successfully:', newPlaceResult[0]);
        res.status(201).json({ 
            message: 'Place submitted successfully', 
            place: newPlaceResult[0] 
        });

    } catch (error: any) {
        console.error('❌ Place submission error:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
            table: error.table,
            column: error.column
        });

        logger.error(`Error submitting place by user ${userId}:`, error);
        
        res.status(500).json({ 
            message: 'Error submitting place',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                code: error.code,
                detail: error.detail
            } : undefined
        });
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
            userId: userId,
            placeId: place.id,
            content: content,
            parentId: parentId == null ? null : parentId, // Can be null for top-level comments
        }).returning();
        const newComment = newCommentResult[0];

        res.status(201).json(newComment);
    } catch (error: any) {
        logger.error(`Error adding comment: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;