import React, { useState, useEffect, useCallback } from "react";
import { DataItem } from "../../../shared/types";
import SearchFilter from "../components/SearchFilter";
import { ListItemSkeleton } from "../components/ListItemSkeleton";
import DataList from "../components/DataList";
import { Toast } from "../components/Toast";

interface CacheEntry {
  data: DataItem[];
  expiry: number;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isVisible: boolean;
}

function HomePage() {
    const [items, setItems] = useState<DataItem[]>([]);
    const [filterText, setFilterText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
    const [validPlaceTypes, setValidPlaceTypes] = useState<string[]>([]);

  const cacheExpiryTime = 60 * 60 * 1000;

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "info") => {
      setToast({ message, type, isVisible: true });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

    const getCacheKey = (lat: number, lng: number, keyword: string) => {
        return `nearbyData_${lat}_${lng}_${keyword}`;
    };

    const fetchValidPlaceTypes = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/nearby');
            const data = await response.json();

            if (data.validTypes && Array.isArray(data.validTypes)) {
                setValidPlaceTypes(data.validTypes);
            } else {
                setError("Failed to load valid place types.");
            }
        } catch (error: any) {
            setError(`Error fetching valid place types: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        fetchValidPlaceTypes();
    }, [fetchValidPlaceTypes]);

  const fetchData = useCallback(
    async (searchKeyword: string) => {
      if (!location) {
        setError("Location is required to fetch nearby data.");
        showToast("Location is required to fetch nearby data.", "error");
        return;
      }

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

        const cachedEntry = cache.get(cacheKey);
        if (cachedEntry && cachedEntry.expiry > now) {
            console.log("Using cached data for keyword:", searchKeyword);
            setItems(cachedEntry.data);
            setIsLoading(false);
            return;
        }

        try {
            console.log(`Fetching data for keyword: "${searchKeyword}"`);

            const response = await fetch('http://localhost:3001/api/nearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    keyword: searchKeyword
                })
            });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();

            const validatedData: DataItem[] = [];
            if (Array.isArray(rawData)) {
                rawData.forEach((item: any) => {
                    try {
                        const validatedItem = {
                            name: item.name,
                            formattedAddress: item.formattedAddress,
                            types: item.types,
                            websiteUri: item.websiteUri,
                            rating: item.rating,
                            userRatingCount: item.userRatingCount,
                            location: item.location
                        };
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

            const newCache = new Map(cache);
            newCache.set(cacheKey, {
                data: validatedData,
                expiry: now + cacheExpiryTime,
            });
            setCache(newCache);

        if (validatedData.length > 0) {
          showToast(
            `Found ${validatedData.length} results for "${searchKeyword}"`,
            "success"
          );
        } else {
          showToast(`No results found for "${searchKeyword}"`, "warning");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch data";
        setError(errorMessage);
        showToast(errorMessage, "error");
        console.error("API data error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [location, cache, cacheExpiryTime, showToast]
  );

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

  const handleItemSelect = useCallback(
    (item: DataItem, index: number) => {
      showToast(`Selected: ${item.name}`, "info");
      // You can add more functionality here, like opening a detail view
    },
    [showToast]
  );

  const displayItems = items;

  return (
    <div className="home-page">
      <h1 className="app-title">Local Data Lister</h1>

            <SearchFilter onSearch={handleSearch} validPlaceTypes={validPlaceTypes} />

      <hr className="divider" />

      {locationLoading && (
        <p className="loading-message" role="status" aria-live="polite">
          Getting your location...
        </p>
      )}

      {isLoading && (
        <div className="data-list">
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

      {!locationLoading &&
        !isLoading &&
        !error &&
        (displayItems.length > 0 ? (
          <DataList
            items={displayItems}
            onItemSelect={handleItemSelect}
            enableKeyboardNavigation={true}
          />
        ) : filterText ? (
          <p>No items found for "{filterText}". Try a different search term.</p>
        ) : (
          <p>Enter a search term to find nearby places.</p>
        ))}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />
    </div>
  );
}

export default HomePage;
