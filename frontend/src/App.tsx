import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './context/AuthContext'; // Import the hook

function App() {
  const { isLoggedIn, logout, user } = useAuth(); // Use the context

  return (
    <BrowserRouter>
      <header style={{ padding: '1rem', background: '#1e293b', color: 'white' }}>
        <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Local Data Lister
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isLoggedIn ? (
              // If the user is logged in, show their email and a logout button
              <>
                <span>Welcome, {user?.email}</span>
                <button onClick={logout} style={{ background: 'var(--danger-color)' }}>Logout</button>
              </>
            ) : (
              // If not logged in, show login and register buttons
              <>
                <Link to="/login"><button>Login</button></Link>
                <Link to="/register"><button style={{ background: 'var(--success-color)' }}>Register</button></Link>
              </>
            )}
          </div>
        </nav>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;