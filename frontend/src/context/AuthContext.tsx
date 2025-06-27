// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@shared/types'; // <-- Import the shared type

// Define the shape of the data and functions in our context
interface AuthContextType {
    token: string | null;
    user: User | null; // <-- Use the User type
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoggedIn: boolean;
    updateUser: (updatedUserData: Partial<User>) => void; // <-- Add an update function
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider component.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null); // <-- Use the User type

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken: string, newUser: User) => { // <-- Use the User type
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    
    // vvv NEW FUNCTION vvv
    const updateUser = (updatedUserData: Partial<User>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const newUser = { ...currentUser, ...updatedUserData };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    const isLoggedIn = !!token;

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn, updateUser }}>
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