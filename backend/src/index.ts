// backend/src/index.ts
import * as dotenv from 'dotenv';

dotenv.config();

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import logger from "./logger";
import fetch, { Headers, RequestInit } from 'node-fetch';

// Import all the routers
import authRouter from './auth';
import placesRouter from './places';

const app = express();
const port = 3001;
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- API Routers ---
app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);

// List of valid place types from the Google Places API
const validPlaceTypes = [
    "airport", "amusement_park", "aquarium", "art_gallery", "atm", "bakery",
    "bank", "bar", "beauty_salon", "bicycle_store", "book_store", "bowling_alley", "bus_station", "cafe",
    "campground", "car_dealer", "car_rental", "car_repair", "car_wash", "casino", "cemetery", "church",
    "city_hall", "clothing_store", "convenience_store", "courthouse", "dentist", "department_store",
    "doctor", "drugstore", "electrician", "electronics_store", "embassy", "establishment", "finance",
    "fire_station", "florist", "food", "furniture_store", "gas_station", "geocode",
    "grocery_store", "gym", "hair_care", "hardware_store", "health", "hindu_temple", "home_goods_store",
    "hospital", "insurance_agency", "jewelry_store", "laundry", "lawyer", "library", "liquor_store",
    "local_government_office", "locality", "locksmith", "lodging", "meal_delivery", "meal_takeaway", "mosque",
    "movie_rental", "movie_theater", "moving_company", "museum", "natural_feature", "neighborhood",
    "night_club", "painter", "park", "parking", "pet_store", "pharmacy", "physiotherapist", "place_of_worship",
    "plumber", "police", "post_office", "postal_code", "premise", "primary_school", "real_estate_agency",
    "restaurant", "roofing_contractor", "route", "rv_park", "school", "secondary_school", "shoe_store",
    "shopping_mall", "spa", "stadium", "storage", "store", "street_address", "street_number", "sublocality",
    "subway_station", "supermarket", "synagogue", "taxi_stand", "train_station", "transit_station",
    "travel_agency", "university", "veterinary_care", "zoo"
];

// --- Caching Logic ---
interface CacheEntry {
    data: any;
    expiry: number;
}
const cache = new Map<string, CacheEntry>();
const cacheExpiryTime = 60 * 60 * 1000; // 1 hour

const getCacheKey = (latitude: string, longitude: string, keyword: string) => {
    return `nearbyData_${latitude}_${longitude}_${keyword}`;
};

// --- Route Handlers for Google Places API Proxy ---
interface NearbyRequest {
  latitude: string;
  longitude: string;
  keyword: string;
}

const nearbyPostHandler: RequestHandler = async (req: Request<{}, {}, NearbyRequest>, res: Response): Promise<any> => {
    try {
        const { latitude, longitude, keyword } = req.body;

        logger.info(`Request received: lat=${latitude}, lng=${longitude}, keyword=${keyword}`);

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required in the request body.' });
        }

        if (!googleApiKey) {
            logger.error("GOOGLE_PLACES_API_KEY is not set in environment variables");
            return res.status(500).json({ message: 'API key not configured.' });
        }

        if (keyword && !validPlaceTypes.includes(keyword)) {
            logger.warn(`Invalid place type: ${keyword}`);
            return res.status(400).json({
                message: `Invalid place type. Must be one of: ${validPlaceTypes.join(', ')}`,
                validTypes: validPlaceTypes
            });
        }

        const cacheKey = getCacheKey(latitude, longitude, keyword);
        const cachedEntry = cache.get(cacheKey);
        const now = Date.now();

        if (cachedEntry && cachedEntry.expiry > now) {
            logger.info(`Returning cached data for ${cacheKey}`);
            return res.json(cachedEntry.data);
        }

        logger.info(`Fetching data from Google Places API for ${cacheKey}`);

        const url = 'https://places.googleapis.com/v1/places:searchNearby';
        const requestBody = {
            includedTypes: [keyword || "restaurant"],
            maxResultCount: 10,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                    },
                    radius: 5000.0
                }
            }
        };

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-Goog-Api-Key', googleApiKey);
        headers.append('X-Goog-FieldMask', 'places.displayName,places.formattedAddress,places.types,places.websiteUri,places.rating,places.userRatingCount,places.location');

        const options: RequestInit = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        };
        
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorBody = await response.text();
            logger.error(`Google Places API error! Status: ${response.status}, Body: ${errorBody}`);
            return res.status(response.status).json({
                message: `Google Places API error: ${errorBody}`,
                statusCode: response.status,
            });
        }

        const data = await response.json();
        logger.info(`Raw API Data: ${JSON.stringify(data, null, 2)}`);

        if (!data || !data.places || !Array.isArray(data.places)) {
            logger.warn('API returned no results or invalid format');
            return res.status(200).json([]);
        }

        // *** THIS IS THE CRUCIAL MODIFICATION ***
        // We create our own stable ID to send to the frontend for routing.
        const transformedResults = data.places.map((place: any) => {
            const name = place.displayName?.text || 'Unknown';
            const address = place.formattedAddress || 'Unknown';
            
            return {
                googlePlaceId: `${name}_${address}`, // Create a stable, unique ID
                name: name,
                formattedAddress: address,
                types: place.types || [],
                websiteUri: place.websiteUri || null,
                rating: place.rating || null,
                userRatingCount: place.userRatingCount || null,
                location: place.location || null
            };
        });

        cache.set(cacheKey, {
            data: transformedResults,
            expiry: now + cacheExpiryTime,
        });
        logger.info(`Cached data for ${cacheKey}, expires at ${new Date(now + cacheExpiryTime)}`);

        logger.info(`Transformed Data: ${JSON.stringify(transformedResults, null, 2)}`);
        return res.json(transformedResults);

    } catch (error: any) {
        logger.error(`Error fetching data: ${error.message}`);
        logger.error(`Error stack: ${error.stack}`);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const nearbyGetHandler: RequestHandler = (req: Request, res: Response, next: NextFunction): any => {
    try {
        if (!googleApiKey) {
            return res.status(500).json({ message: 'API key not configured' });
        }
        return res.json({
            message: 'API key is configured',
            keyPrefix: googleApiKey.substring(0, 10) + '...',
            keyLength: googleApiKey.length,
            validTypes: validPlaceTypes
        });
    } catch (error:any) {
        next(error);
    }
};

app.post('/api/nearby', nearbyPostHandler);
app.get('/api/nearby', nearbyGetHandler);


// --- Centralized Error Handling ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`);
    logger.error(`Error stack: ${err.stack}`);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// --- Start the Server ---
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

export default app;