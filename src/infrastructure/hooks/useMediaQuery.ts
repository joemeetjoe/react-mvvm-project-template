import { useState, useEffect } from 'react';

/**
 * Returns true when the given CSS media query matches.
 * @param query - A valid CSS media query string (e.g., "(max-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', handler);
    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
