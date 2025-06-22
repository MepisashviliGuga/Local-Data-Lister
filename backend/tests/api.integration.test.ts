import request from "supertest";
import { describe, it, expect } from "@jest/globals";

const api = request("http://localhost:3001");

describe("API Integration Tests", () => {
  describe("POST /api/nearby", () => {
    it("should return a 200 OK status for a valid request", async () => {
      const response = await api
        .post("/api/nearby")
        .send({
          latitude: "40.7128",
          longitude: "-74.0060",
          keyword: "restaurant",
        });
      expect(response.status).toBe(200);
    });

    it("should return a JSON array of nearby places", async () => {
      const response = await api
        .post("/api/nearby")
        .send({
          latitude: "40.7128",
          longitude: "-74.0060",
          keyword: "restaurant",
        });
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return a 400 Bad Request if latitude or longitude is missing", async () => {
      const response = await api.post("/api/nearby").send({ keyword: "restaurant" });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Latitude and longitude are required");
    });

    it("should return a 400 Bad Request for an invalid place type (keyword)", async () => {
      const response = await api
        .post("/api/nearby")
        .send({
          latitude: "40.7128",
          longitude: "-74.0060",
          keyword: "invalid_place_type",
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid place type");
    });

    it("should handle an empty keyword and default to 'restaurant'", async () => {
        const response = await api
            .post("/api/nearby")
            .send({
                latitude: "40.7128",
                longitude: "-74.0060",
                keyword: "",
            });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

     it("should return an empty array if no results are found", async () => {
          const response = await api
              .post("/api/nearby")
              .send({
                  latitude: "0.0",
                  longitude: "0.0",
                  keyword: "restaurant",
              });

          expect(response.status).toBe(200);
          expect(response.body).toEqual([]);
      });
  });

  describe("GET /api/nearby", () => {
      it("should return 200 OK with API key info if the key is configured", async () => {
          const response = await api.get("/api/nearby");
          expect(response.status).toBe(200);
          expect(response.body.message).toBe("API key is configured");
          expect(response.body.keyPrefix).toBeDefined();
          expect(response.body.keyLength).toBeDefined();
          expect(Array.isArray(response.body.validTypes)).toBe(true);
      });
  });
});