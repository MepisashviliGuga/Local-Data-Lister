import request from "supertest";

import { describe, it, expect } from "@jest/globals";

const api = request("http://localhost:3001");

describe("API Integration Tests", () => {
  describe("GET /api/items", () => {
    it("should return a 200 OK status", async () => {
      const response = await api.get("/api/items");
      expect(response.status).toBe(200);
    });

    it("should return a JSON array", async () => {
      const response = await api.get("/api/items");
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body).toBeInstanceOf(Array);
    });

    it("should return a combined list of all items (restaurants, parks, events)", async () => {
      const response = await api.get("/api/items");
      // Based on our test_data.json (2+2+2=6)
      expect(response.body.length).toBe(6);
    });
  });

  describe("GET /api/search", () => {
    it('should find items by name (e.g., "Park")', async () => {
      const response = await api.get("/api/search?q=Park");
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      // Check if at least one result contains "Park"
      expect(
        response.body.some((item: any) => item.name.includes("Park"))
      ).toBe(true);
    });

    it("should return an empty array for a search term with no matches", async () => {
      const response = await api.get("/api/search?q=ThisWillNeverMatch123");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a 400 Bad Request if the "q" query parameter is missing', async () => {
      const response = await api.get("/api/search");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "A search query parameter 'q' is required."
      );
    });
  });
});
