// frontend/src/services/userService.ts
import { fetchWithAuth } from './apiHelper'; // Use the shared helper

const API_URL = 'http://localhost:3001/api/users';

export const getMe = () => {
    return fetchWithAuth(`${API_URL}/me`);
};

export const updateProfile = (profileData: { name?: string; email?: string; password?: string }) => {
    return fetchWithAuth(`${API_URL}/me`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

export const getAllUsers = () => {
    return fetchWithAuth(API_URL);
};

export const getUserProfile = (userId: string) => {
    return fetchWithAuth(`${API_URL}/${userId}`);
};