// frontend/src/components/SearchFilter.tsx
import React from 'react';

// Define the props for this component
export interface SearchFilterProps {
  // This is a function given by the parent component.
  // We will call it every time the input text changes.
  onFilterChange: (newFilterText: string) => void;
}

function SearchFilter({ onFilterChange }: SearchFilterProps) {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Call the parent's function with the new value from the input box
    onFilterChange(event.target.value);
  };

  return (
    <div>
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