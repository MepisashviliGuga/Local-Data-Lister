// frontend/src/components/DataList.tsx

import { DataItem } from '../../../shared/types'; // Using the working relative path
import ListItem from './ListItem';

interface DataListProps {
  items: DataItem[];
}

function DataList({ items }: DataListProps) {
  // If the list is empty (e.g., after a filter finds no matches), show a message.
  if (items.length === 0) {
    return <p>No items found.</p>;
  }

  return (
    <div>
      {/* Loop over the items and render a ListItem for each one */}
      {items.map((item) => (
        <ListItem key={item.name} item={item} />
      ))}
    </div>
  );
}

export default DataList;