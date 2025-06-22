import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../services/authService';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await authService.register(email, password);
            setSuccess('Registration successful! Redirecting to login...');
            // Wait 2 seconds before redirecting to give user time to read the message
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            // The error message comes from the Error we threw in our authService
            setError(err.message);
        }
    };

    return (
        <div className="home-page" style={{ maxWidth: '500px', margin: '4rem auto' }}>
            <h1 className="app-title">Register</h1>
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
                {success && <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>{success}</p>}
                <button type="submit">Register</button>
            </form>
             <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default RegisterPage;