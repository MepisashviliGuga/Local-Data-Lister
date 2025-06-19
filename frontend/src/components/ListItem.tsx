// frontend/src/components/ListItem.tsx
import React from 'react';
import { DataItem } from '../../../shared/types';

interface ListItemProps {
    item: DataItem;
}

function ListItem({ item }: ListItemProps) {
    return (
        <div className="list-item">
            <h3 className="item-name">{item.name}</h3>
            <p>Type: {item.type}</p>
            {item.type === 'restaurant' && <p>Cuisine: {item.cuisine}</p>}
            {item.type === 'park' && <p>Amenities: {item.amenities.join(', ')}</p>}
            {item.type === 'event' && (
                <>
                    <p>Date: {item.date}</p>
                    <p>Time: {item.time}</p>
                </>
            )}
        </div>
    );
}

export default ListItem;