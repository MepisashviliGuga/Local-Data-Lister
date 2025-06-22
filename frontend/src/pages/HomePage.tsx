import React, { useState, useEffect, useCallback } from 'react';
import { DataItem } from '../../../shared/types';
import SearchFilter from '../components/SearchFilter';
import DataList from '../components/DataList';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast';

function HomePage() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // State for user-initiated searches
    const [items, setItems] = useState<DataItem[]>([]);
    const [filterText, setFilterText] = useState('');
    
    // State for displaying public data to logged-out users
    const [communityFavorites, setCommunityFavorites] = useState<DataItem[]>([]);

    // General state
    const [isLoading, setIsLoading] = useState(false); // Used for both search and public fetching
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [validPlaceTypes, setValidPlaceTypes] = useState<string[]>([]);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' | 'warning' });

    // Fetch place types for the dropdown (publicly accessible)
    const fetchValidPlaceTypes = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/nearby');
            const data = await response.json();
            if (data.validTypes && Array.isArray(data.validTypes)) {
                setValidPlaceTypes(data.validTypes);
            }
        } catch (error: any) {
            console.error("Failed to load valid place types.");
        }
    }, []);

    // Fetch community favorites for logged-out users
    const fetchCommunityFavorites = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/places/community-favorites');
            if (!response.ok) throw new Error("Could not load community favorites.");
            const data = await response.json();
            setCommunityFavorites(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchValidPlaceTypes();
        // Get user's physical location once on load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
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
    }, [fetchValidPlaceTypes]);

    // This effect decides what public data to show based on login state
    useEffect(() => {
        if (!isLoggedIn) {
            fetchCommunityFavorites();
        } else {
            // Clear community data when user logs in to show search prompt
            setCommunityFavorites([]); 
        }
    }, [isLoggedIn, fetchCommunityFavorites]);
    
    // The actual search data fetch function for logged-in users
    const fetchData = useCallback(async (searchKeyword: string) => {
        if (!location) return setError("Location is required to fetch nearby data.");
        if (!searchKeyword.trim()) return setItems([]);
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude, keyword: searchKeyword })
            });
            if (!response.ok) throw new Error((await response.json()).message || "Search failed");
            setItems(await response.json());
        } catch (err: any) {
            setError(err.message);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [location]);

    // The protected search handler
    const handleSearch = (searchText: string) => {
        if (!isLoggedIn) {
            setToast({ isVisible: true, message: 'Please log in to search for places.', type: 'warning' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        setFilterText(searchText);
        if (location) {
            fetchData(searchText);
        }
    };

    // --- RENDER LOGIC ---
    return (
        <div className="home-page">
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
            
            {!isLoggedIn && !locationLoading && (
                <>
                    <h2 style={{ textAlign: 'center' }}>Community Favorites</h2>
                    <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Log in to search, comment, and add your own favorites!</p>
                    {isLoading && <p className="loading-message">Loading community favorites...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {!isLoading && communityFavorites.length > 0 && <DataList items={communityFavorites} />}
                    {!isLoading && communityFavorites.length === 0 && !error && <p style={{textAlign: 'center'}}>No community favorites yet. Log in to be the first!</p>}
                </>
            )}
            
            {isLoggedIn && !locationLoading && (
                <>
                    {isLoading && <p className="loading-message">Searching for places...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {!isLoading && !error && (
                        items.length > 0 ? (
                            <DataList items={items} />
                        ) : filterText ? (
                            <p style={{textAlign: 'center'}}>No items found for "{filterText}". Try a different search term.</p>
                        ) : (
                            <p style={{textAlign: 'center'}}>Select a place type and click Search to find nearby places.</p>
                        )
                    )}
                </>
            )}
        </div>
    );
}

export default HomePage;