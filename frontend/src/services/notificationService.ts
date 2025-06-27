// frontend/src/services/notificationService.ts
import { fetchWithAuth } from './apiHelper';

const API_URL = 'http://localhost:3001/api/notifications';

export const getNotifications = () => {
    return fetchWithAuth(API_URL);
};

export const markNotificationsAsRead = (ids: number[]) => {
    return fetchWithAuth(`${API_URL}/mark-read`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
};