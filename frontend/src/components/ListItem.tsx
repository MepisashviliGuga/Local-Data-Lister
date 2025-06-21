// frontend/src/components/ListItem.tsx
import React from "react";
import { DataItem } from "../../../shared/types";

interface ListItemProps {
  item: DataItem;
  index: number; // Receive the index as a prop
}

function ListItem({ item, index }: ListItemProps) {
  // Calculate the delay. Each item will be delayed by 50ms more than the last.
  const animationDelay = `${index * 50}ms`;

  return (
    <div
      className="list-item"
      // Set the CSS custom property here
      style={{ "--animation-delay": animationDelay } as React.CSSProperties}
    >
      <h3 className="item-name">{item.name}</h3>
      <p>Type: {item.type}</p>
      <p>Location: {item.location}</p>
      <hr className="divider" />
    </div>
  );
}

export default ListItem;
