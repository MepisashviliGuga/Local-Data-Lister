// frontend/src/services/apiHelper.ts
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
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

    // Handle responses that might not have a body (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return; 
    }
};