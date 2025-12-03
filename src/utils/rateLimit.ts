/**
 * Client-side rate limiting utility
 * Prevents excessive API calls and helps avoid hitting Supabase email rate limits
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the rate limit (e.g., email address, IP, action type)
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with isLimited flag and timeUntilReset
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): { isLimited: boolean; timeUntilReset: number; attemptsRemaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // No entry or window expired, allow the action
    rateLimitStore.set(key, {
      count: 0,
      resetTime: now + windowMs,
    });
    return {
      isLimited: false,
      timeUntilReset: windowMs,
      attemptsRemaining: maxAttempts,
    };
  }

  if (entry.count >= maxAttempts) {
    // Rate limit exceeded
    return {
      isLimited: true,
      timeUntilReset: entry.resetTime - now,
      attemptsRemaining: 0,
    };
  }

  // Increment count and allow
  entry.count++;
  return {
    isLimited: false,
    timeUntilReset: entry.resetTime - now,
    attemptsRemaining: maxAttempts - entry.count,
  };
}

/**
 * Record an attempt (increment the counter)
 * @param key - Unique identifier for the rate limit
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds
 */
export function recordAttempt(
  key: string,
  maxAttempts: number = 3,
  windowMs: number = 60 * 60 * 1000
): void {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else {
    entry.count++;
  }
}

/**
 * Format time until reset in a human-readable format
 */
export function formatTimeUntilReset(ms: number): string {
  if (ms <= 0) return "now";
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}${seconds > 0 ? ` and ${seconds} second${seconds > 1 ? "s" : ""}` : ""}`;
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

