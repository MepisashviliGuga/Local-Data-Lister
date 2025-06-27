import request from 'supertest';
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import app from '../src/index';

// Import the Headers class
import fetch, { Headers } from 'node-fetch';

// Properly mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('POST /api/nearby', () => {
  const originalApiKey = process.env.GOOGLE_PLACES_API_KEY;
  process.env.GOOGLE_PLACES_API_KEY = 'test_api_key';

  const validRequestBody = {
    latitude: 40.7128,
    longitude: -74.0060,
    keyword: 'restaurant',
  };

  beforeEach(() => {
    mockedFetch.mockClear();
  });

  afterAll(() => {
    process.env.GOOGLE_PLACES_API_KEY = originalApiKey;
  });

  describe('when the request is valid and the Google API succeeds', () => {
    it('should return a 200 OK with transformed data', async () => {
      const mockGooglePlacesData = {
        places: [{
          displayName: { text: 'Test Restaurant' },
          formattedAddress: '123 Test St, Test City',
          types: ['restaurant', 'food'],
          websiteUri: 'http://test.com',
          rating: 4.5,
          userRatingCount: 100,
          location: { latitude: 40.7128, longitude: -74.0060 },
        }],
      };

      // Create mock response with proper typing
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockGooglePlacesData,
        text: async () => '',
      };

      mockedFetch.mockResolvedValue(mockResponse as any);

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Restaurant');
      expect(response.body[0].formattedAddress).toBe('123 Test St, Test City');
      expect(response.body[0].rating).toBe(4.5);
    });
  });

  describe('when the Google Places API returns an error', () => {
    it('should forward the error status and message', async () => {
      const errorMessage = 'API key not valid. Please pass a valid API key.';
      
      const mockResponse = {
        ok: false,
        status: 403,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => errorMessage,
      };

      mockedFetch.mockResolvedValue(mockResponse as any);

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('API key not valid');
    });
  });

  describe('when the Google Places API returns no results', () => {
    it('should return a 200 OK with an empty array', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ places: [] }),
        text: async () => '',
      };

      mockedFetch.mockResolvedValue(mockResponse as any);

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('when required parameters are missing', () => {
    it('should return 400 when latitude is missing', async () => {
      const response = await request(app)
        .post('/api/nearby')
        .send({ longitude: -74.0060, keyword: 'restaurant' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Latitude and longitude are required');
    });

    it('should return 400 when longitude is missing', async () => {
      const response = await request(app)
        .post('/api/nearby')
        .send({ latitude: 40.7128, keyword: 'restaurant' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Latitude and longitude are required');
    });
  });

  describe('when an invalid place type is provided', () => {
    it('should return 400 with valid types list', async () => {
      const response = await request(app)
        .post('/api/nearby')
        .send({ 
          latitude: 40.7128, 
          longitude: -74.0060, 
          keyword: 'invalid_place_type' 
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid place type');
      expect(response.body.validTypes).toBeDefined();
    });
  });

  describe('when the fetch throws an error', () => {
    it('should return 500 with error message', async () => {
      mockedFetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch nearby places.');
      expect(response.body.error).toBe('Network error');
    });
  });

  describe('when the API returns malformed data', () => {
    it('should handle missing places array gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ someOtherField: 'value' }),
        text: async () => '',
      };

      mockedFetch.mockResolvedValue(mockResponse as any);

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle null response data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => null,
        text: async () => '',
      };

      mockedFetch.mockResolvedValue(mockResponse as any);

      const response = await request(app).post('/api/nearby').send(validRequestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});