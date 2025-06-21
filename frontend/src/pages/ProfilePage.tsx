// frontend/src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import { Toast } from '../components/Toast';

function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });

    const showToast = (message: string, type: 'info' | 'success' | 'error') => {
        setToast({ isVisible: true, message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updateData: { name?: string; email?: string; password?: string } = {};

        if (name !== user?.name) updateData.name = name;
        if (email !== user?.email) updateData.email = email;
        if (password) updateData.password = password;

        if (Object.keys(updateData).length === 0) {
            showToast("No changes to save.", "info");
            return;
        }

        try {
            const response = await userService.updateProfile(updateData);
            updateUser(response.user);
            showToast("Profile updated successfully!", "success");
            setPassword(''); // Clear password field after update
        } catch (err: any) {
            showToast(err.message, "error");
        }
    };

    return (
        <div className="home-page" style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <Toast 
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
            <h1 className="app-title">My Profile</h1>
            <form onSubmit={handleSubmit}>
                <div className="search-filter">
                    <label htmlFor="name-input">Name</label>
                    <input id="name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="search-filter">
                    <label htmlFor="email-input">Email</label>
                    <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="search-filter">
                    <label htmlFor="password-input">New Password</label>
                    <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default ProfilePage;