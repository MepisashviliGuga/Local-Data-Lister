// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage'; // <-- Import
import UsersListPage from './pages/UsersListPage'; // <-- Import
import PublicProfilePage from './pages/PublicProfilePage'; // <-- Import
import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <BrowserRouter>
      <header style={{ padding: '1rem', background: '#1e293b', color: 'white' }}>
        <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Local Data Lister
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                {/* vvv ADDED LINKS vvv */}
                <Link to="/users" style={{ color: 'white', fontWeight: '500', textDecoration: 'none' }}>
                  Find People
                </Link>
                <Link to="/my-favorites" style={{ color: 'white', fontWeight: '500', textDecoration: 'none' }}>
                  My Favorites
                </Link>
                <Link to="/profile" style={{ color: 'white', fontWeight: '500', textDecoration: 'none' }}>
                  Welcome, {user?.name || user?.email}
                </Link>
                <button onClick={logout} style={{ background: 'var(--danger-color)' }}>Logout</button>
              </>
            ) : (
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
          <Route path="/place/:googlePlaceId" element={<PlaceDetailsPage />} />
          <Route path="/my-favorites" element={<FavoritesPage />} />
          {/* vvv ADDED ROUTES vvv */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;