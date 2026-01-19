import { useEffect, useRef } from 'react';

/**
 * Hook to prevent endless loading states
 * Automatically stops loading after a timeout period
 */
export function useLoadingTimeout(
  loading: boolean,
  timeout: number = 10000, // 10 seconds default
  onTimeout?: () => void
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      // Set timeout to stop loading
      timeoutRef.current = setTimeout(() => {
        console.warn('Loading timeout reached, stopping loader');
        onTimeout?.();
      }, timeout);
    } else {
      // Clear timeout if loading stops
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, timeout, onTimeout]);

  return null;
}

