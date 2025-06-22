// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataItem } from '../../../shared/types';
import SearchFilter from '../components/SearchFilter';
import DataList from '../components/DataList';

function HomePage() {
    const [items, setItems] = useState<DataItem[]>([]);
    const [filterText, setFilterText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [validPlaceTypes, setValidPlaceTypes] = useState<string[]>([]);

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

    const fetchData = useCallback(async (searchKeyword: string) => {
        if (!location) {
            setError("Location is required to fetch nearby data.");
            return;
        }

        if (!searchKeyword.trim()) {
            setItems([]);
            return;
        }

        setIsLoading(true);
        setError(null);

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

            setItems(rawData);  // Set items directly from response

        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error("API data error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [location]);

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

            <SearchFilter onSearch={handleSearch} validPlaceTypes={validPlaceTypes} />

            <hr className="divider" />

            {locationLoading && <p className="loading-message">Getting your location...</p>}
            {isLoading && <p className="loading-message">Searching for places...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!locationLoading && !isLoading && !error && (
                displayItems.length > 0 ? (
                    <DataList items={displayItems} />
                ) : filterText ? (
                    <p>No items found for "{filterText}". Try a different search term.</p>
                ) : (
                    <p>Enter a search term to find nearby places.</p>
                )
            )}
        </div>
    );
}

export default HomePage;