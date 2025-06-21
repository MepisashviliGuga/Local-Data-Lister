import { useEffect, useRef, useState } from "react";

interface UseKeyboardNavigationProps {
  itemCount: number;
  onSelect?: (index: number) => void;
  onEnter?: (index: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  itemCount,
  onSelect,
  onEnter,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || itemCount === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          break;

        case "Home":
          event.preventDefault();
          setSelectedIndex(0);
          break;

        case "End":
          event.preventDefault();
          setSelectedIndex(itemCount - 1);
          break;

        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && onEnter) {
            onEnter(selectedIndex);
          }
          break;

        case "Escape":
          event.preventDefault();
          setSelectedIndex(-1);
          if (onEscape) {
            onEscape();
          }
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabIndex", "0");
      container.setAttribute("role", "listbox");
    }

    return () => {
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [itemCount, selectedIndex, onSelect, onEnter, onEscape, enabled]);

  useEffect(() => {
    if (selectedIndex >= 0 && onSelect) {
      onSelect(selectedIndex);
    }
  }, [selectedIndex, onSelect]);

  const getItemProps = (index: number) => ({
    role: "option",
    "aria-selected": selectedIndex === index,
    tabIndex: selectedIndex === index ? 0 : -1,
    className: selectedIndex === index ? "list-item-selected" : "",
  });

  return {
    selectedIndex,
    setSelectedIndex,
    containerRef,
    getItemProps,
  };
};
