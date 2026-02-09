/**
 * Simple in-memory rate limiter
 * Limits: 10 requests per 10 seconds per identifier (IP address)
 * 
 * This is a basic implementation suitable for single-server deployments.
 * For multi-server setups, consider using Redis-based rate limiting.
 */

const requests = new Map<string, number[]>();

const WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS = 10;  // Maximum requests per window

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (typically IP address)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Get existing requests for this identifier
    const userRequests = requests.get(identifier) || [];

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= MAX_REQUESTS) {
        return false; // Rate limited
    }

    // Add current request timestamp
    recentRequests.push(now);
    requests.set(identifier, recentRequests);

    // Periodic cleanup (1% chance on each call)
    if (Math.random() < 0.01) {
        cleanup(now, WINDOW_MS);
    }

    return true; // Request allowed
}

/**
 * Clean up old entries from the rate limit cache
 */
function cleanup(now: number, windowMs: number) {
    const cutoff = now - windowMs;

    for (const [key, times] of requests.entries()) {
        const validTimes = times.filter(t => t > cutoff);
        if (validTimes.length === 0) {
            requests.delete(key);
        } else {
            requests.set(key, validTimes);
        }
    }
}

/**
 * Get the client's IP address from the request
 */
export function getClientIP(headers: Headers): string {
    return headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        headers.get("x-real-ip") ||
        "unknown";
}
