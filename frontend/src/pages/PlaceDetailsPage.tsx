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
    const { isLoggedIn, token, logout } = useAuth();

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
        if (!initialPlaceData && googlePlaceId) {
            console.warn("No initial place data. Page was likely reloaded directly.");
            setInitialPlaceData({ googlePlaceId: decodeURIComponent(googlePlaceId), name: "Loading..." });
        }
        fetchDetails();
    }, [googlePlaceId, initialPlaceData, fetchDetails]);

    const handleInteraction = async (endpoint: string, body: object) => {
        if (!isLoggedIn) {
            alert("Please log in to perform this action.");
            return null;
        }
        
        console.log(`[DEBUG] Making request to '${endpoint}'. Sending token:`, token);
        
        const response = await fetch(`http://localhost:3001/api/places/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        // --- THIS IS THE CORRECTED LOGIC ---
        // Handle the 401 Unauthorized case FIRST.
        if (response.status === 401) {
            logout();
            alert("Your session has expired. Please log in again.");
            // We throw an error here to be caught by the calling function's catch block,
            // preventing it from trying to process a null response.
            // This also prevents the generic error alert below from firing.
            throw new Error("Session expired"); 
        }
        
        // Handle all other non-ok responses.
        if (!response.ok) {
            const errorData = await response.json();
            // This will be caught by the catch block in the calling function (handleFavorite, etc.)
            throw new Error(errorData.message || "An unknown server error occurred.");
        }
        
        // If everything was ok, return the JSON data.
        return response.json();
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            const placePayload = {
                ...initialPlaceData,
                googlePlaceId: decodeURIComponent(googlePlaceId!),
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
        } catch (error) {
            // The catch block is now simpler. It only catches real errors or our 'Session expired' error.
            // We can choose to not show an alert for the session expiry since we already did.
            if ((error as Error).message !== "Session expired") {
                alert(`Error: ${(error as Error).message}`);
            }
            console.error(error);
        }
    };
    
    const handleFavorite = async () => {
        try {
            const placePayload = {
                ...initialPlaceData,
                googlePlaceId: decodeURIComponent(googlePlaceId!),
            };

            const result = await handleInteraction('favorite', {
                placeData: placePayload,
                isFavorite: true 
            });

            if (result) {
                alert(`${initialPlaceData?.name} has been added to your favorites!`);
                if (!dbPlace) fetchDetails();
            }
        } catch (error) {
            if ((error as Error).message !== "Session expired") {
                alert(`Error: ${(error as Error).message}`);
            }
            console.error(error);
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