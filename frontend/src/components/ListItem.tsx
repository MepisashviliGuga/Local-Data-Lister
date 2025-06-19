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
            <p>location: {item.location}</p>
             <hr className="divider" />
        </div>
    );
}

export default ListItem;