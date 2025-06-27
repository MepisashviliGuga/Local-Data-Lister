// frontend/src/components/ListItemSkeleton.tsx
import React from 'react';
import './ListItemSkeleton.css';

export const ListItemSkeleton = () => (
  <div className="list-item-skeleton">
    <div className="skeleton-line title" />
    <div className="skeleton-line text" />
    <div className="skeleton-line text short" />
  </div>
);