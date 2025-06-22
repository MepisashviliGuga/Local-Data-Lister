const API_URL = 'http://localhost:3001/api/auth';

// Registers a new user
export const register = async (email, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    // If the response is not OK (e.g., status 409, 500), parse the error message and throw it
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed due to an unknown error.');
    }

    return response.json();
};

// Logs in a user
export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed due to an unknown error.');
    }

    return response.json();
};