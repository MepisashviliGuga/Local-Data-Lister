// frontend/src/components/DataList.tsx
import React from 'react';
import { DataItem } from '../../../shared/types';
import ListItem from './ListItem';

interface DataListProps {
    items: DataItem[];
}

function DataList({ items }: DataListProps) {
    return (
        <div className="data-list">
            {items.map((item, index) => (
                <ListItem key={index} item={item} />
            ))}
        </div>
    );
}

export default DataList;