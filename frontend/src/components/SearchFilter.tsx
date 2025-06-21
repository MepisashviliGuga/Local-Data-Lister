import React, { useState } from 'react';

export interface SearchFilterProps {
    onSearch: (newFilterText: string) => void;
    validPlaceTypes: string[];
}

function SearchFilter({ onSearch, validPlaceTypes }: SearchFilterProps) {
    const [selectedType, setSelectedType] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value);
    };

    const handleSubmit = () => {
        onSearch(selectedType);
    };

    return (
        <div className="search-filter">
            <label htmlFor="search-filter">Select Place Type:</label>
            <select
                id="search-filter"
                value={selectedType}
                onChange={handleChange}
            >
                <option value="">All Types</option>
                {validPlaceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <button onClick={handleSubmit}>Search</button>
        </div>
    );
}

export default SearchFilter;