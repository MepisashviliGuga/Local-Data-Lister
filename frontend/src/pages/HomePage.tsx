// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataItem } from '../../../shared/types';
import SearchFilter from '../components/SearchFilter';
import DataList from '../components/DataList';

// --- NEW IMPORTS ---
import { useAuth } from '../context/AuthContext'; // To check login status
import { useNavigate } from 'react-router-dom'; // To redirect the user
import { Toast } from '../components/Toast'; // For user feedback

function HomePage() {
    // --- AUTHENTICATION HOOKS ---
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // --- TOAST STATE ---
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' | 'warning' });

    // Existing states
    const [items, setItems] = useState<DataItem[]>([]);
    const [filterText, setFilterText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [validPlaceTypes, setValidPlaceTypes] = useState<string[]>([]);
    
    // ... (keep fetchValidPlaceTypes, useEffect for location, etc. They are all fine)

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
            const response = await fetch('http://localhost:3001/api/nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    keyword: searchKeyword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            setItems(rawData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            setItems([]); // Clear previous results on error
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


    // --- MODIFIED handleSearch FUNCTION ---
    const handleSearch = (searchText: string) => {
        // 1. Check if user is logged in
        if (!isLoggedIn) {
            // Show a toast notification
            setToast({ isVisible: true, message: 'Please log in to search for places.', type: 'warning' });
            // Optional: redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            return; // Stop the function here
        }

        // 2. If logged in, proceed with the search
        console.log(`Search initiated for: "${searchText}"`);
        setFilterText(searchText);
        if (location) {
            fetchData(searchText);
        }
    };

    const displayItems = items;

    return (
        <div className="home-page">
            {/* --- RENDER THE TOAST COMPONENT --- */}
            <Toast 
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <h1 className="app-title">Local Data Lister</h1>

            <SearchFilter onSearch={handleSearch} validPlaceTypes={validPlaceTypes} />

            <hr className="divider" />

            {locationLoading && <p className="loading-message">Getting your location...</p>}
            
            {/* Show a clear message to unauthenticated users */}
            {!isLoggedIn && !locationLoading && (
                <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
                    Welcome! Please log in or register to start searching for nearby places.
                </p>
            )}
            
            {/* Only show search-related content if the user is logged in */}
            {isLoggedIn && (
                <>
                    {isLoading && <p className="loading-message">Searching for places...</p>}
                    {error && <p className="error-message">Error: {error}</p>}

                    {!isLoading && !error && (
                        displayItems.length > 0 ? (
                            <DataList items={displayItems} />
                        ) : filterText ? (
                            <p>No items found for "{filterText}". Try a different search term.</p>
                        ) : (
                            <p>Select a place type and click Search to find nearby places.</p>
                        )
                    )}
                </>
            )}
        </div>
    );
}

export default HomePage;