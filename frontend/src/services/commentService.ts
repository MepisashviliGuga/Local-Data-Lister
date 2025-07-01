// frontend/src/services/commentService.ts
import { fetchWithAuth } from './apiHelper';
 
const API_URL = 'http://localhost:3001/api/comments';
 
export const voteOnComment = (commentId: number, value: 1 | -1) => {
    return fetchWithAuth(`${API_URL}/${commentId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ value }),
    });
};