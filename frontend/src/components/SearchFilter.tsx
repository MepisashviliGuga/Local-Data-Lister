// frontend/src/components/SearchFilter.tsx
import React, { useState } from 'react';

export interface SearchFilterProps {
    onSearch: (newFilterText: string) => void;
    isLoading: boolean; // Add this new prop
}

function SearchFilter({ onSearch, isLoading }: SearchFilterProps) {
    const [inputText, setInputText] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleSubmit = () => {
        onSearch(inputText);
    };

    return (
        <div className="search-filter">
            <label htmlFor="search-filter">Filter Items:</label>
            <input
                id="search-filter"
                type="text"
                placeholder="Type to search..."
                value={inputText}
                onChange={handleChange}
                disabled={isLoading} // Also disable the input
            />
            <button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </div>
    );
}

export default SearchFilter;