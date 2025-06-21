// frontend/src/pages/PublicProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as userService from '../services/userService';
import { User, DataItem } from '@shared/types';
import DataList from '../components/DataList';

interface PublicProfile {
    user: User;
    favorites: DataItem[];
}

function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            try {
                const data = await userService.getUserProfile(id);
                setProfile(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (isLoading) return <p className="loading-message">Loading profile...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!profile) return <p className="error-message">User not found.</p>;

    return (
        <div className="home-page">
            <h1 className="app-title">{profile.user.name || profile.user.email}'s Profile</h1>
            <hr className="divider" />
            <h2 style={{ textAlign: 'center' }}>Favorite Places</h2>
            {profile.favorites.length > 0 ? (
                <DataList items={profile.favorites} />
            ) : (
                <p style={{ textAlign: 'center' }}>This user has no favorite places yet.</p>
            )}
        </div>
    );
}

export default PublicProfilePage;