import { useMemo, useRef, useState, useEffect } from "react";

interface UseVirtualizationProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualization = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualizationProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    return items;
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const totalHeight = itemCount * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleScrollEvent = () => {
        setScrollTop(container.scrollTop);
      };

      container.addEventListener("scroll", handleScrollEvent);
      return () => container.removeEventListener("scroll", handleScrollEvent);
    }
  }, []);

  return {
    virtualItems,
    totalHeight,
    containerRef,
    handleScroll,
  };
};
