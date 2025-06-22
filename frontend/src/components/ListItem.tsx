// frontend/src/components/ListItem.tsx
import React from 'react';
import { DataItem } from '../../../shared/types';
import { Link } from 'react-router-dom';

interface ListItemProps {
    item: DataItem;
}

function ListItem({ item }: ListItemProps) {
    return (
        // THE KEY CHANGE IS HERE vvv
        <Link to={`/place/${encodeURIComponent(item.googlePlaceId)}`} state={{ place: item }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="list-item">
                <h3 className="item-name">{item.name}</h3>
                <p>Address: {item.formattedAddress}</p>
                <p>Rating: {item.rating} ⭐ ({item.userRatingCount} reviews)</p>
                <p>Types: {item.types?.join(', ')}</p>
                {item.websiteUri && (
                    <p>
                        Website: 
                        <a 
                          href={item.websiteUri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()} // This stops the click from propagating to the parent Link
                        >
                          {item.websiteUri}
                        </a>
                    </p>
                )}
                 {item.location && <p>Location: {item.location.latitude}, {item.location.longitude}</p>}
                <hr className="divider" />
            </div>
        </Link>
    );
}

export default ListItem;