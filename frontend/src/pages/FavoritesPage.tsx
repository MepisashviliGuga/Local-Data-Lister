import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DataList from '../components/DataList';
import { DataItem } from '../../../shared/types';

function FavoritesPage() {
    const { isLoggedIn, token } = useAuth();
    const [favorites, setFavorites] = useState<DataItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }

        const fetchFavorites = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/places/me/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setFavorites(data);
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFavorites();
    }, [isLoggedIn, token]);

    if (!isLoggedIn) {
        return (
            <div className="home-page">
                <h1 className="app-title">My Favorites</h1>
                <p style={{textAlign: 'center'}}>Please log in to see your favorite places.</p>
            </div>
        );
    }
    
    if (isLoading) return <p className="loading-message">Loading your favorites...</p>;

    return (
        <div className="home-page">
            <h1 className="app-title">My Favorites</h1>
            {favorites.length > 0 ? (
                <DataList items={favorites} />
            ) : (
                <p style={{textAlign: 'center'}}>You haven't favorited any places yet.</p>
            )}
        </div>
    );
}

export default FavoritesPage;