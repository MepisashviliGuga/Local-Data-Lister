import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of the data and functions in our context
interface AuthContextType {
    token: string | null;
    user: { id: number; email: string } | null;
    login: (token: string, user: { id: number; email: string }) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider component. This will wrap our entire app.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);

    // This effect runs only once when the app starts
    useEffect(() => {
        // Check if a user session is already stored in the browser's localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken: string, newUser: { id: number; email: string }) => {
        setToken(newToken);
        setUser(newUser);
        // Store the session in localStorage to persist it across page refreshes
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        // Clear the session from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isLoggedIn = !!token; // A simple boolean to check if the user is logged in

    // Provide the state and functions to all child components
    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};