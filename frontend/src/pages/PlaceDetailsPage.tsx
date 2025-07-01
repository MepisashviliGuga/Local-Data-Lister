// frontend/src/pages/PlaceDetailsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataItem, Comment } from '../../../shared/types';
import CommentItem from '../components/CommentItem';
import * as commentService from '../services/commentService'; // Import comment service
 
function PlaceDetailsPage() {
    const { googlePlaceId } = useParams<{ googlePlaceId: string }>();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, token, logout } = useAuth();
 
    const [initialPlaceData, setInitialPlaceData] = useState<DataItem | null>(state?.place || null);
    const [dbPlace, setDbPlace] = useState<DataItem | null>(null);
 
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
 
    const fetchDetails = useCallback(async () => {
        if (!googlePlaceId || !token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/places/by-google-id/${encodeURIComponent(googlePlaceId)}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setDbPlace(data.place);
                setComments(data.comments);
            } else {
                console.log("This place is not yet in our database.");
                setDbPlace(null);
                setComments([]);
            }
        } catch (error) {
            console.error("Failed to fetch place details", error);
        } finally {
            setIsLoading(false);
        }
    }, [googlePlaceId, token, logout, navigate]);
 
    useEffect(() => {
        if (!isLoggedIn) {
             navigate('/login');
             return;
        }
        if (!initialPlaceData && googlePlaceId) {
            setInitialPlaceData({ googlePlaceId: decodeURIComponent(googlePlaceId), name: "Loading..." });
        }
        fetchDetails();
    }, [googlePlaceId, initialPlaceData, fetchDetails, isLoggedIn, navigate]);
    // Recursive function to update a comment's vote state in the nested structure
    const updateCommentVoteState = (comments: Comment[], commentId: number, newScore: number, newVote: 1 | -1 | null): Comment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                return { ...comment, score: newScore, userVote: newVote };
            }
            if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: updateCommentVoteState(comment.replies, commentId, newScore, newVote) };
            }
            return comment;
        });
    };
 
    const handleVote = async (commentId: number, value: 1 | -1) => {
        // Find the comment and its current state for optimistic update
        let currentComment: Comment | undefined;
        const findComment = (cs: Comment[]) => {
            for (const c of cs) {
                if (c.id === commentId) { currentComment = c; return; }
                if (c.replies) findComment(c.replies);
            }
        };
        findComment(comments);
        if (!currentComment) return;
 
        const oldScore = currentComment.score;
        const oldVote = currentComment.userVote;
 
        let newScore = oldScore;
        let newVote: 1 | -1 | null;
 
        if (oldVote === value) { // Undoing vote
            newScore -= value;
            newVote = null;
        } else if (oldVote !== null) { // Changing vote
            newScore -= oldVote;
            newScore += value;
            newVote = value;
        } else { // New vote
            newScore += value;
            newVote = value;
        }
        // Optimistic UI update
        setComments(prevComments => updateCommentVoteState(prevComments, commentId, newScore, newVote));
 
        try {
            await commentService.voteOnComment(commentId, value);
        } catch (error) {
            // Revert on error
            setComments(prevComments => updateCommentVoteState(prevComments, commentId, oldScore, oldVote));
            alert("Failed to cast vote. Please try again.");
            console.error(error);
        }
    };
 
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
 
    const handleCommentSubmit = async (content: string, parentId: number | null = null) => {
        if (!content.trim()) return;
 
        try {
            const placePayload = { ...initialPlaceData, googlePlaceId: decodeURIComponent(googlePlaceId!) };
            await handleInteraction('comment', {
                placeData: placePayload,
                content: content,
                parentId: parentId,
            });
            fetchDetails(); 
            if (!parentId) {
                setNewComment('');
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
    if (!isLoggedIn) return null; // Should be redirected by useEffect
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
<CommentItem key={comment.id} comment={comment} onReplySubmit={handleCommentSubmit} onVote={handleVote}/>
                )) : !isLoading && <p>No comments yet. Be the first!</p>}
</div>
</div>
    );
}
 
export default PlaceDetailsPage;