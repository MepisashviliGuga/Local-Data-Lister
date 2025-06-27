// frontend/src/components/CommentItem.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Comment } from '@shared/types';

interface CommentItemProps {
    comment: Comment;
    onReplySubmit: (content: string, parentId: number) => void;
}

function CommentItem({ comment, onReplySubmit }: CommentItemProps) {
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
                {isLoggedIn && (
                    <button className="reply-button" onClick={() => setIsReplying(!isReplying)}>
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                )}
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
                        <CommentItem key={reply.id} comment={reply} onReplySubmit={onReplySubmit} />
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