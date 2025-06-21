// frontend/src/components/ListItem.tsx
import React from "react";
import { DataItem } from "../../../shared/types";

interface ListItemProps {
  item: DataItem;
  index: number;
  onClick?: () => void;
  role?: string;
  "aria-selected"?: boolean;
  tabIndex?: number;
  className?: string;
}

function ListItem({
  item,
  index,
  onClick,
  role,
  "aria-selected": ariaSelected,
  tabIndex,
  className = "",
}: ListItemProps) {
  // Calculate the delay. Each item will be delayed by 50ms more than the last.
  const animationDelay = `${index * 50}ms`;

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`list-item ${className}`}
      style={{ "--animation-delay": animationDelay } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={role}
      aria-selected={ariaSelected}
      tabIndex={tabIndex}
    >
      <h3 className="item-name">{item.name}</h3>
      <p>Type: {item.type}</p>
      <p>Location: {item.location}</p>
      <hr className="divider" />
    </div>
  );
}

export default ListItem;
