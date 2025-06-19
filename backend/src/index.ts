import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from "./logger";
import fetch, { Headers, RequestInit } from 'node-fetch';

dotenv.config();

const app = express();
const port = 3001;
const apiKey = process.env.RAPIDAPI_KEY;

app.use(express.json());
app.use(cors());

app.get('/api/nearby', async (req: Request, res: Response) => {
    const { latitude, longitude, keyword } = req.query;

    if (!latitude || !longitude) {
        res.status(400).send({ message: 'Missing required parameters.' });
    }

    if (!apiKey) {
        logger.error("RAPIDAPI_KEY is not set in environment variables");
        res.status(500).json({ message: 'API key not configured.' });
        return;
    }

    const url = `https://search-nearby-places.p.rapidapi.com/api/v1/topfivePlaces?latitude=${latitude}&longitude=${longitude}&keyword=${keyword}`;

    const headers = new Headers();
    headers.append('X-RapidAPI-Key', apiKey);
    headers.append('X-RapidAPI-Host', 'search-nearby-places.p.rapidapi.com');

    const options: RequestInit = {
        method: 'GET',
        headers: headers,
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`RapidAPI error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Log the full raw data for inspection
        logger.info(`Raw API Data: ${JSON.stringify(data, null, 2)}`);

        if (!data.top5 || !Array.isArray(data.top5)) {
            logger.warn('API returned no results or invalid format');
            res.status(200).json([]);
        }

        // Transform the data
        const transformedResults = data.top5.map((item: any) => {

            return {
                name: item.name || 'Unknown',
                location: item.address || 'Unknown',
                type: item.category || 'Unknown',
                rating: item.rating || 0
            };
        });

        logger.info(`Transformed Data: ${JSON.stringify(transformedResults, null, 2)}`);

        res.json(transformedResults);

    } catch (error) {
        logger.error(`Error fetching data: ${error}`);
        res.status(500).send({ message: 'Failed to fetch nearby places.' });
    }
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
