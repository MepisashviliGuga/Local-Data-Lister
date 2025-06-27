// frontend/src/pages/PlaceDetailsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataItem, Comment } from '../../../shared/types';
import CommentItem from '../components/CommentItem'; // Import new component

function PlaceDetailsPage() {
    const { googlePlaceId } = useParams<{ googlePlaceId: string }>();
    const { state } = useLocation();
    const { isLoggedIn, token, logout, user } = useAuth();

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
            setInitialPlaceData({ googlePlaceId: decodeURIComponent(googlePlaceId), name: "Loading..." });
        }
        fetchDetails();
    }, [googlePlaceId, initialPlaceData, fetchDetails]);

    const handleInteraction = async (endpoint: string, body: object) => {
        if (!isLoggedIn) {
            alert("Please log in to perform this action.");
            return null;
        }
        
        const response = await fetch(`http://localhost:3001/api/places/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            logout();
            alert("Your session has expired. Please log in again.");
            throw new Error("Session expired"); 
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "An unknown server error occurred.");
        }
        
        return response.json();
    };
    
    // Unified comment submission handler
    const handleCommentSubmit = async (content: string, parentId: number | null = null) => {
        if (!content.trim()) return;

        try {
            const placePayload = { ...initialPlaceData, googlePlaceId: decodeURIComponent(googlePlaceId!) };
            await handleInteraction('comment', {
                placeData: placePayload,
                content: content,
                parentId: parentId,
            });
            
            // Re-fetch all comments to get the updated nested structure
            fetchDetails(); 
            if (!parentId) {
                setNewComment(''); // Clear main text area only for top-level comments
            }
        } catch (error) {
            if ((error as Error).message !== "Session expired") {
                alert(`Error: ${(error as Error).message}`);
            }
            console.error(error);
        }
    };

    const handleFavorite = async () => {
        try {
            const placePayload = { ...initialPlaceData, googlePlaceId: decodeURIComponent(googlePlaceId!) };
            await handleInteraction('favorite', { placeData: placePayload, isFavorite: true });
            alert(`${initialPlaceData?.name} has been added to your favorites!`);
            if (!dbPlace) fetchDetails();
        } catch (error) {
            if ((error as Error).message !== "Session expired") {
                alert(`Error: ${(error as Error).message}`);
            }
            console.error(error);
        }
    };

    const displayPlace = dbPlace || initialPlaceData;

    if (isLoading && !displayPlace) return <p className="loading-message">Loading place details...</p>;
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
                <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(newComment); }} style={{marginBottom: '2rem'}}>
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
                {isLoading && comments.length === 0 && <p>Loading comments...</p>}
                {!isLoading && comments.length > 0 ? comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} onReplySubmit={handleCommentSubmit} />
                )) : !isLoading && <p>No comments yet. Be the first!</p>}
            </div>
        </div>
    );
}

export default PlaceDetailsPage;