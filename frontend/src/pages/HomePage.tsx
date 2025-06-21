import React, { useState, useEffect, useCallback } from "react";
import { DataItem } from "../../../shared/types";
import SearchFilter from "../components/SearchFilter";
import { ListItemSkeleton } from "../components/ListItemSkeleton";
import DataList from "../components/DataList";

// Zod schemas
import { z } from "zod";

// Zod schemas for general properties only (name, location, rating, etc.)
const BaseDataItemSchema = z.object({
  name: z.string(),
  location: z.string().nullable(),
  rating: z.number().nullable(),
  type: z.string(), // Allow any string for the type
});

// Cache interface
interface CacheEntry {
  data: DataItem[];
  expiry: number;
}

function HomePage() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  const cacheExpiryTime = 60 * 60 * 1000;

  const getCacheKey = (lat: number, lng: number, keyword: string) => {
    return `nearbyData_${lat}_${lng}_${keyword}`;
  };

  const fetchData = useCallback(
    async (searchKeyword: string) => {
      if (!location) {
        setError("Location is required to fetch nearby data.");
        return;
      }

      // Don't search if keyword is empty
      if (!searchKeyword.trim()) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const now = Date.now();
      const cacheKey = getCacheKey(
        location.latitude,
        location.longitude,
        searchKeyword
      );

      // Check cache
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry && cachedEntry.expiry > now) {
        console.log("Using cached data for keyword:", searchKeyword);
        setItems(cachedEntry.data);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Fetching data for keyword: "${searchKeyword}"`);
        const response = await fetch(
          `http://localhost:3001/api/nearby?latitude=${location.latitude}&longitude=${location.longitude}&keyword=${searchKeyword}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();

        // Data Validation
        const validatedData: DataItem[] = [];
        if (Array.isArray(rawData)) {
          rawData.forEach((item: any) => {
            try {
              const validatedItem = BaseDataItemSchema.parse(item) as DataItem;
              validatedData.push(validatedItem);
            } catch (err: any) {
              console.error("Validation error for item:", item, err.errors);
              setError("Data validation failed. Check console for details.");
            }
          });
        }

        console.log(
          `Setting ${validatedData.length} items for keyword: "${searchKeyword}"`
        );
        setItems(validatedData);

        // Update cache
        const newCache = new Map(cache);
        newCache.set(cacheKey, {
          data: validatedData,
          expiry: now + cacheExpiryTime,
        });
        setCache(newCache);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        console.error("API data error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [location, cache, cacheExpiryTime]
  );

  // Get user's current location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLocationLoading(false);
          },
          (error) => {
            setError(`Error getting location: ${error.message}`);
            setLocationLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        setLocationLoading(false);
      }
    };
    getLocation();
  }, []);

  const handleSearch = (searchText: string) => {
    console.log(`Search initiated for: "${searchText}"`);
    setFilterText(searchText);
    if (location) {
      fetchData(searchText);
    }
  };

  const displayItems = items;

  return (
    <div className="home-page">
      <h1 className="app-title">Local Data Lister</h1>

      <SearchFilter
        onSearch={handleSearch}
        isLoading={isLoading || locationLoading}
      />

      <hr className="divider" />

      {locationLoading && (
        <p className="loading-message" role="status" aria-live="polite">
          Getting your location...
        </p>
      )}

      {/* This is the new part */}
      {isLoading && (
        <div className="data-list">
          {/* Render 5 skeletons to match the API's top 5 results */}
          {Array.from({ length: 5 }).map((_, index) => (
            <ListItemSkeleton key={index} />
          ))}
        </div>
      )}

      {error && (
        <p className="error-message" role="alert" aria-live="assertive">
          Error: {error}
        </p>
      )}

      {locationLoading && (
        <p className="loading-message">Getting your location...</p>
      )}
      {isLoading && <p className="loading-message">Searching for places...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {locationLoading && (
        <p className="loading-message" role="status" aria-live="polite">
          Getting your location...
        </p>
      )}
      {isLoading && (
        <p className="loading-message" role="status" aria-live="polite">
          Searching for places...
        </p>
      )}
      {error && (
        <p className="error-message" role="alert" aria-live="assertive">
          Error: {error}
        </p>
      )}
    </div>
  );
}

export default HomePage;
