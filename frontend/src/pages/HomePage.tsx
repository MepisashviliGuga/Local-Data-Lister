// frontend/src/pages/HomePage.tsx

import { useState, useMemo } from 'react';
// We are using the confirmed working relative path for imports.
import { DataItem } from '../../../shared/types'; 

import SearchFilter from '../components/SearchFilter';
import DataList from '../components/DataList';

// This is our simulated static data source, as described by your lecturer.
// It matches your 'shared/types.ts' interfaces without the 'id' property.
const MOCK_DATA: DataItem[] = [
  { name: 'Pizza Palace', cuisine: 'Italian', location: '123 Main St', openingHours: '10-10', priceRange: '$$', rating: 4, type: 'restaurant' },
  { name: 'City Park', amenities: ['benches', 'fountain'], location: '456 Center St', openingHours: '6-10', size: 'large', type: 'park' },
  { name: 'The Grind Cafe', cuisine: 'Coffee', location: '789 Side St', openingHours: '7-7', priceRange: '$', rating: 5, type: 'restaurant' },
  { name: 'Summer Music Festival', category: 'Music', date: '2024-08-15', description: 'Live bands all day', location: 'City Park', price: 25, time: '12:00 PM', type: 'event' }
];

function HomePage() {
  // State to hold the master list of all items. We initialize it with our mock data.
  const [items] = useState<DataItem[]>(MOCK_DATA);
  
  // State to hold the current text from the search box. It starts empty.
  const [filterText, setFilterText] = useState('');

  // This is the core filtering logic.
  // `useMemo` is a performance optimization hook. It only recalculates the
  // filtered list when the `items` or `filterText` state changes.
  const filteredItems = useMemo(() => {
    // If the search box is empty, return the full, original list.
    if (!filterText) {
      return items; 
    }
    // Otherwise, filter the list. Convert both the item name and the search text
    // to lower case for a case-insensitive search.
    return items.filter(item =>
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [items, filterText]); // The dependencies for useMemo

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Local Data Lister</h1>
      
      {/* We render the SearchFilter component and pass it the `setFilterText`
          function. This is how the child component can update the state in this parent component. */}
      <SearchFilter onFilterChange={setFilterText} />
      
      <hr style={{ margin: '20px 0' }}/>
      
      {/* We render the DataList component and pass it the final, filtered list to display. */}
      <DataList items={filteredItems} />
    </div>
  );
}

export default HomePage;