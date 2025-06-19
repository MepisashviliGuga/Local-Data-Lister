// frontend/src/components/SearchFilter.tsx
import React from 'react';

export interface SearchFilterProps {
    onFilterChange: (newFilterText: string) => void;
}

function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange(event.target.value);
    };

    return (
        <div className="search-filter">
            <label htmlFor="search-filter">Filter Items:</label>
            <input
                id="search-filter"
                type="text"
                placeholder="Type to search..."
                onChange={handleChange}
            />
        </div>
    );
}

export default SearchFilter;