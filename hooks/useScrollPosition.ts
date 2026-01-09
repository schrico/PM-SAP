import { useState, useEffect } from "react";

/**
 * Custom hook to track scroll position
 * @param threshold - Minimum scroll position in pixels to return true (default: 300)
 * @returns boolean indicating if scroll position is above threshold
 */
export function useScrollPosition(threshold: number = 300): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}
