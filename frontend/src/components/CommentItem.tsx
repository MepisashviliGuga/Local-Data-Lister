// frontend/src/components/CommentItem.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Comment } from '@shared/types';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Import icons
 
interface CommentItemProps {
    comment: Comment;
    onReplySubmit: (content: string, parentId: number) => void;
    onVote: (commentId: number, value: 1 | -1) => void; // Add onVote handler
}
 
function CommentItem({ comment, onReplySubmit, onVote }: CommentItemProps) {
    const { isLoggedIn } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showAllReplies, setShowAllReplies] = useState(false);
 
    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        onReplySubmit(replyContent, comment.id);
        setReplyContent('');
        setIsReplying(false);
    };
 
    const visibleReplies = showAllReplies ? comment.replies : comment.replies.slice(0, 3);
 
    return (
<div className="comment-item">
<div className="comment-content">
<p>
<strong>{comment.author?.name || comment.author?.email || '[Deleted User]'}</strong>
<span className="comment-date"> on {new Date(comment.createdAt).toLocaleDateString()}</span>
</p>
<p>{comment.content}</p>
<div className="comment-actions">
<div className="vote-controls">
<button 
                            className={`vote-button ${comment.userVote === 1 ? 'active' : ''}`}
                            onClick={() => onVote(comment.id, 1)}
                            disabled={!isLoggedIn}
                            aria-label="Upvote"
>
<ArrowUp size={16} />
</button>
<span className="vote-score">{comment.score}</span>
<button 
                            className={`vote-button ${comment.userVote === -1 ? 'active' : ''}`}
                            onClick={() => onVote(comment.id, -1)}
                            disabled={!isLoggedIn}
                            aria-label="Downvote"
>
<ArrowDown size={16} />
</button>
</div>
                    {isLoggedIn && (
<button className="reply-button" onClick={() => setIsReplying(!isReplying)}>
                            {isReplying ? 'Cancel' : 'Reply'}
</button>
                    )}
</div>
</div>
 
            {isReplying && (
<form onSubmit={handleSubmitReply} className="reply-form">
<textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Replying to ${comment.author?.name || 'user'}...`}
                        autoFocus
                    />
<button type="submit">Post Reply</button>
</form>
            )}
 
            {visibleReplies && visibleReplies.length > 0 && (
<div className="comment-replies">
                    {visibleReplies.map(reply => (
<CommentItem key={reply.id} comment={reply} onReplySubmit={onReplySubmit} onVote={onVote} />
                    ))}
                    {comment.replies.length > 3 && (
<button className="toggle-replies-button" onClick={() => setShowAllReplies(!showAllReplies)}>
                            {showAllReplies ? 'Hide Replies' : `View ${comment.replies.length - 3} more replies...`}
</button>
                    )}
</div>
            )}
</div>
    );
}
 
export default CommentItem;