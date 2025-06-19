// frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DataItem } from '../../../shared/types';
import SearchFilter from '../components/SearchFilter';
import DataList from '../components/DataList';
import '../App.css'; // Import general styles

function HomePage() {
    const [items, setItems] = useState<DataItem[]>([]);
    const [filterText, setFilterText] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Start loading
            setError(null); // Clear any previous errors
            try {
                const response = await fetch('http://localhost:3001/api/items');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setItems(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error("Failed to fetch data:", err);
            } finally {
                setIsLoading(false); // End loading
            }
        };

        fetchData();
    }, []);

    const filteredItems = useMemo(() => {
        if (!filterText) {
            return items;
        }
        return items.filter(item =>
            item.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [items, filterText]);

    return (
        <div className="home-page">
            <h1 className="app-title">Local Data Lister</h1>

            <SearchFilter onFilterChange={setFilterText} />

            <hr className="divider" />

            {isLoading && <p className="loading-message">Loading data...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {/* Conditionally render DataList only when items is not empty and not loading */}
            {!isLoading && !error && (
                filteredItems.length > 0 ? (
                    <DataList items={filteredItems} />
                ) : (
                    <p>No items found matching your search.</p>
                )
            )}
        </div>
    );
}

export default HomePage;