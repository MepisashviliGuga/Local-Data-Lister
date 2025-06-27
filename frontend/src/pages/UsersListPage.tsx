// frontend/src/pages/UsersListPage.tsx
import React, { useState, useEffect } from 'react';
import * as userService from '../services/userService';
import { User } from '@shared/types';
import { Link } from 'react-router-dom';

function UsersListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (isLoading) return <p className="loading-message">Loading users...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="home-page">
            <h1 className="app-title">Find People</h1>
            <div className="data-list">
                {users.map(user => (
                    <Link key={user.id} to={`/users/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="list-item">
                            <h3 className="item-name">{user.name || 'Anonymous User'}</h3>
                            <p className="item-details">{user.email}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default UsersListPage;