// frontend/src/services/userService.ts

const API_URL = 'http://localhost:3001/api/users';

// Helper to handle authenticated requests
// vvv THE FIX IS HERE vvv
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    // Create a new Headers object to avoid type issues with spread
    const requestHeaders = new Headers(options.headers);
    requestHeaders.set('Content-Type', 'application/json');
    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers: requestHeaders });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An API error occurred.');
    }

    // Handle cases where the response might not have a body (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return response.text(); // or handle as needed
    }
};

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