// frontend/src/components/SearchFilter.tsx
import React, { useState } from "react";

export interface SearchFilterProps {
  onFilterChange: (newFilterText: string) => void;
}

function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [inputText, setInputText] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputText(value);
    onFilterChange(value);
  };

  const handleSubmit = () => {
    onFilterChange(inputText);
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
