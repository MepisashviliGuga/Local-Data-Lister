
import { DataItem } from '../../../shared/types'; 

interface ListItemProps {
  item: DataItem;
}

function ListItem({ item }: ListItemProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
      <h3>{item.name}</h3>
      <p>Type: {item.type}</p>
      {/* We can even add type-specific details! */}
      {item.type === 'restaurant' && <p>Cuisine: {item.cuisine}</p>}
      {item.type === 'park' && <p>Amenities: {item.amenities.join(', ')}</p>}
    </div>
  );
}

export default ListItem;