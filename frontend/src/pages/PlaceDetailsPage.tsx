// frontend/src/pages/PlaceDetailsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataItem } from '../../../shared/types';

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: {
        email: string;
    };
}

function PlaceDetailsPage() {
    const { googlePlaceId } = useParams<{ googlePlaceId: string }>();
    const { state } = useLocation();
    const { isLoggedIn, token } = useAuth();

    const [initialPlaceData, setInitialPlaceData] = useState<DataItem | null>(state?.place || null);
    const [dbPlace, setDbPlace] = useState<DataItem | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        if (!googlePlaceId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/places/by-google-id/${encodeURIComponent(googlePlaceId)}`);
            if (response.ok) {
                const data = await response.json();
                setDbPlace(data.place);
                setComments(data.comments);
            } else {
                console.log("This place is not yet in our database. It will be created on the first user interaction.");
                setDbPlace(null);
                setComments([]);
            }
        } catch (error) {
            console.error("Failed to fetch place details", error);
        } finally {
            setIsLoading(false);
        }
    }, [googlePlaceId]);

    useEffect(() => {
        // If we don't have the initial data (e.g., user refreshed the page),
        // we should try to fetch it. This is a more advanced case, but for now
        // we rely on the state being passed from the Link.
        if (!initialPlaceData && googlePlaceId) {
            // In a real app, you might have another endpoint to get Google's data by ID.
            // For now, we'll log a warning. The page might look sparse but interactions will work.
            console.warn("No initial place data. Page was likely reloaded directly.");
            // We create a minimal initialPlaceData object so interactions can work.
            setInitialPlaceData({ googlePlaceId: decodeURIComponent(googlePlaceId), name: "Loading..." });
        }
        fetchDetails();
    }, [googlePlaceId, initialPlaceData, fetchDetails]);

    const handleInteraction = async (endpoint: string, body: object) => {
        if (!isLoggedIn) {
            alert("Please log in to perform this action.");
            return null;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/places/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "An unknown error occurred.");
            }
            return response.json();
        } catch (error) {
            console.error(`Failed to ${endpoint}`, error);
            alert(`An error occurred: ${(error as Error).message}`);
            return null;
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        // --- FIX IS HERE ---
        // Construct the placeData object explicitly to ensure googlePlaceId is included.
        const placePayload = {
            ...initialPlaceData,
            googlePlaceId: decodeURIComponent(googlePlaceId!), // Always use the ID from the URL
        };
        
        const addedComment = await handleInteraction('comment', {
             placeData: placePayload,
             content: newComment 
        });

        if (addedComment) {
            setComments([addedComment, ...comments]);
            setNewComment('');
            if (!dbPlace) fetchDetails();
        }
    };
    
    const handleFavorite = async () => {
        // --- FIX IS HERE ---
        // Construct the placeData object explicitly to ensure googlePlaceId is included.
        const placePayload = {
            ...initialPlaceData,
            googlePlaceId: decodeURIComponent(googlePlaceId!), // Always use the ID from the URL
        };

        const result = await handleInteraction('favorite', {
            placeData: placePayload,
            isFavorite: true 
        });

        if (result) {
            alert(`${initialPlaceData?.name} has been added to your favorites!`);
            if (!dbPlace) fetchDetails();
        }
    };

    const displayPlace = dbPlace || initialPlaceData;

    if (isLoading) return <p className="loading-message">Loading place details...</p>;
    if (!displayPlace) return <p className="error-message">Place not found.</p>;

    return (
        <div className="home-page">
            <h1 className="app-title">{displayPlace.name}</h1>
            <div className="list-item" style={{marginBottom: '2rem'}}>
                <p>Address: {displayPlace.formattedAddress}</p>
                <p>Rating: {displayPlace.rating} ⭐ ({displayPlace.userRatingCount} reviews)</p>
                {displayPlace.websiteUri && <p>Website: <a href={displayPlace.websiteUri} target="_blank" rel="noopener noreferrer">{displayPlace.websiteUri}</a></p>}
                {isLoggedIn && <button onClick={handleFavorite} style={{marginTop: '1rem'}}>Add to Favorites</button>}
            </div>

            <hr className="divider" />
            
            <h2 style={{textAlign: 'center'}}>Comments</h2>
            
            {isLoggedIn && (
                <form onSubmit={handleCommentSubmit} style={{marginBottom: '2rem'}}>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Leave a comment..."
                        style={{width: '100%', minHeight: '80px', padding: '0.5rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc'}}
                    />
                    <button type="submit" style={{marginTop: '0.5rem'}}>Post Comment</button>
                </form>
            )}

            <div className="comments-list">
                {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="list-item" style={{marginBottom: '1rem'}}>
                        <p>
                            <strong>{comment.author?.email || '[Deleted User]'}</strong> 
                            <span style={{fontSize: '0.8rem', color: '#666'}}> on {new Date(comment.createdAt).toLocaleDateString()}</span>
                        </p>
                        <p>{comment.content}</p>
                    </div>
                )) : <p>No comments yet. Be the first!</p>}
            </div>
        </div>
    );
}

export default PlaceDetailsPage;