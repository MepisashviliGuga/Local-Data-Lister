// frontend/src/components/SearchFilter.tsx
import React, { useState } from 'react';

export interface SearchFilterProps {
    onSearch: (newFilterText: string) => void;
}

function SearchFilter({ onSearch }: SearchFilterProps) {
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
            />
            <button onClick={handleSubmit}>Search</button>
        </div>
    );
}

export default SearchFilter;