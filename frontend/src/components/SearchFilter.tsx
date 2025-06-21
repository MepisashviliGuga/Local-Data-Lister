import React, { useState, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";

export interface SearchFilterProps {
  onSearch: (newFilterText: string) => void;
  isLoading: boolean;
  debounceMs?: number;
}

function SearchFilter({
  onSearch,
  isLoading,
  debounceMs = 300,
}: SearchFilterProps) {
  const [inputText, setInputText] = useState("");
  const debouncedSearchTerm = useDebounce(inputText, debounceMs);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = useCallback(() => {
    onSearch(inputText);
  }, [inputText, onSearch]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  // Auto-search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== inputText) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, inputText]);

  return (
    <div className="search-filter">
      <label htmlFor="search-filter">Filter Items:</label>
      <input
        id="search-filter"
        type="text"
        placeholder="Type to search... (Press Enter to search immediately)"
        value={inputText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-describedby="search-help"
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
      <div id="search-help" className="search-help">
        {debounceMs > 0 && "Search will trigger automatically as you type"}
      </div>
    </div>
  );
}

export default SearchFilter;
