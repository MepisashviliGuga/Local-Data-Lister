// frontend/src/components/DataList.tsx
import React, { useMemo } from "react";
import { DataItem } from "../../../shared/types";
import ListItem from "./ListItem";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

interface DataListProps {
  items: DataItem[];
  onItemSelect?: (item: DataItem, index: number) => void;
  enableKeyboardNavigation?: boolean;
}

function DataList({
  items,
  onItemSelect,
  enableKeyboardNavigation = true,
}: DataListProps) {
  const { selectedIndex, containerRef, getItemProps } = useKeyboardNavigation({
    itemCount: items.length,
    onSelect: (index) => {
      if (onItemSelect) {
        onItemSelect(items[index], index);
      }
    },
    onEnter: (index) => {
      if (onItemSelect) {
        onItemSelect(items[index], index);
      }
    },
    enabled: enableKeyboardNavigation && items.length > 0,
  });

  const memoizedItems = useMemo(() => {
    return items.map((item, index) => (
      <ListItem
        key={`${item.name}-${index}`}
        item={item}
        index={index}
        {...getItemProps(index)}
        onClick={() => onItemSelect?.(item, index)}
      />
    ));
  }, [items, getItemProps, onItemSelect]);

  return (
    <div
      className="data-list"
      ref={containerRef}
      aria-label="Search results"
      aria-live="polite"
    >
      {memoizedItems}
      {items.length === 0 && (
        <div className="no-results" role="status">
          <p>No results found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

export default DataList;
