// frontend/src/components/PlaceSubmissionForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import Auth Context
import * as placeService from '../services/placeService'; // CREATE THIS
import {toast} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

function PlaceSubmissionForm() {
    const { isLoggedIn } = useAuth(); // get user info or authentication context
    const [name, setName] = useState('');
    const [formattedAddress, setFormattedAddress] = useState('');
    const [websiteUri, setWebsiteUri] = useState('');
    const [types, setTypes] = useState<string[]>([]);
    const [rating, setRating] = useState<number | null>(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            setMessage('You must be logged in to submit a place.');
            return;
        }

        try {
            // FIXED: Generate a unique Google Place ID for manually entered places
            const uniqueGooglePlaceId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const newPlace = { 
                name, 
                formattedAddress, 
                websiteUrl: websiteUri, // Note: backend expects 'websiteUrl'
                types, 
                rating, 
                latitude, 
                longitude,
                uniqueGooglePlaceId // CRITICAL: This was missing!
            };

            console.log('Submitting place data:', newPlace); // Debug log
            
            await placeService.submitPlace(newPlace);
            setMessage('Place submitted successfully!');
            toast.success('Place submitted successfully', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            // Clear the form
            setName('');
            setFormattedAddress('');
            setWebsiteUri('');
            setTypes([]);
            setRating(null);
            setLatitude('');
            setLongitude('');
        } catch (err: any) {
            console.error('Form submission error:', err);
            setMessage(`Error submitting place: ${err.message}`);
            toast.error('Place submitting failed', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    if (!isLoggedIn) {
        return <p>Please login</p>;
    }
    return (
<form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '4rem auto' }}>
<h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Submit a Place</h2>
<div className="search-filter">
<label htmlFor="name">Name:</label>
<input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>
<div className="search-filter">
<label htmlFor="formattedAddress">Address:</label>
<input type="text" id="formattedAddress" value={formattedAddress} onChange={(e) => setFormattedAddress(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>
<div className="search-filter">
<label htmlFor="websiteUri">Website:</label>
<input type="url" id="websiteUri" value={websiteUri} onChange={(e) => setWebsiteUri(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>

                {/* Example for place types - replace with a proper multi-select component */}
<div className="search-filter">
<label htmlFor="types">Types (comma-separated):</label>
<input type="text" id="types" value={types.join(',')} onChange={(e) => setTypes(e.target.value.split(',').filter(t => t.trim()))} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>

                <div className="search-filter">
<label htmlFor="rating">Rating:</label>
<input type="number" id="rating" value={rating ? rating.toString() : ""} onChange={(e) => setRating(Number(e.target.value))} min="0" max="5" step="0.1" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>

                <div className="search-filter">
<label htmlFor="latitude">Latitude:</label>
<input type="number" id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required step="any" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>

                <div className="search-filter">
<label htmlFor="longitude">Longitude:</label>
<input type="number" id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required step="any" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }} />
</div>

                <button type="submit" style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>Submit Place</button>
                {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>{message}</p>}
</form>
    );
}

export default PlaceSubmissionForm;