import React from 'react';
import { DataItem } from '../../../shared/types';

interface ListItemProps {
    item: DataItem;
}

function ListItem({ item }: ListItemProps) {
    return (
        <div className="list-item">
            <h3 className="item-name">{item.name}</h3>
            <p>Address: {item.formattedAddress}</p>
            <p>Rating: {item.rating} ⭐ ({item.userRatingCount} reviews)</p>
            <p>Types: {item.types.join(', ')}</p>
            {item.websiteUri && (
                <p>
                    Website: <a href={item.websiteUri} target="_blank" rel="noopener noreferrer">{item.websiteUri}</a>
                </p>
            )}
            <p>Location: {item.location.latitude}, {item.location.longitude}</p> {/* ✅ Fixed */}
            <hr className="divider" />
        </div>
    );
}

export default ListItem;
