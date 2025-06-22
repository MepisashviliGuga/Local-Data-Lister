import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext'; // Import our custom hook

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); // Get the login function from our context
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await authService.login(email, password);
            login(data.token, data.user); // Update the global state
            navigate('/'); // Redirect to the home page on success
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="home-page" style={{ maxWidth: '500px', margin: '4rem auto' }}>
            <h1 className="app-title">Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="search-filter">
                    <label htmlFor="email-input">Email</label>
                    <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="search-filter">
                    <label htmlFor="password-input">Password</label>
                    <input id="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default LoginPage;