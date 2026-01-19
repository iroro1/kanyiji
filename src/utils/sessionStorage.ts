/**
 * SessionStorage utility for caching data and preventing endless loaders
 * Data persists for the browser session and is cleared when tab closes
 */

export class SessionStorage {
  private static prefix = 'kanyiji_';

  /**
   * Get data from sessionStorage
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Set data in sessionStorage
   */
  static set<T>(key: string, value: T, maxAge?: number): void {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        value,
        timestamp: Date.now(),
        maxAge: maxAge || null, // Optional max age in milliseconds
      };
      sessionStorage.setItem(this.prefix + key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to sessionStorage (${key}):`, error);
    }
  }

  /**
   * Get data with automatic expiration check
   */
  static getWithExpiry<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item) as { value: T; timestamp: number; maxAge: number | null };
      
      // Check if expired
      if (parsed.maxAge && Date.now() - parsed.timestamp > parsed.maxAge) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Remove data from sessionStorage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error);
    }
  }

  /**
   * Clear all kanyiji sessionStorage data
   */
  static clear(): void {
    if (typeof window === 'undefined') return;
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Check if data exists in sessionStorage
   */
  static has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(this.prefix + key) !== null;
  }
}

/**
 * Fetch data with sessionStorage cache and timeout protection
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    maxAge?: number; // Cache max age in milliseconds (default: 5 minutes)
    timeout?: number; // Fetch timeout in milliseconds (default: 10 seconds)
  }
): Promise<T> {
  const maxAge = options?.maxAge || 5 * 60 * 1000; // 5 minutes default
  const timeout = options?.timeout || 10000; // 10 seconds default

  // Check cache first
  const cached = SessionStorage.getWithExpiry<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch with timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });

  try {
    const fetchPromise = fetchFn();
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Cache the result
    SessionStorage.set(key, result, maxAge);
    return result;
  } catch (err) {
    // Try to use stale cache as fallback
    const staleCache = SessionStorage.get<T>(key);
    if (staleCache) {
      return staleCache;
    }
    throw err;
  }
}

