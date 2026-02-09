/**
 * Simple in-memory cache implementation
 * For production with multiple servers, use Redis instead
 */

interface CacheEntry<T> {
    data: T;
    expires: number;
}

class SimpleCache {
    private cache = new Map<string, CacheEntry<any>>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Get cached data or fetch fresh data
     */
    async get<T>(
        key: string,
        ttlMs: number,
        fetcher: () => Promise<T>
    ): Promise<T> {
        const cached = this.cache.get(key);

        // Return cached data if still valid
        if (cached && Date.now() < cached.expires) {
            return cached.data;
        }

        // Fetch fresh data
        const data = await fetcher();

        // Store in cache
        this.cache.set(key, {
            data,
            expires: Date.now() + ttlMs
        });

        return data;
    }

    /**
     * Invalidate specific cache key
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all keys matching pattern
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now >= entry.expires) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export singleton instance
export const cache = new SimpleCache();

/**
 * Helper function for caching
 * @param key - Cache key
 * @param ttlMs - Time to live in milliseconds
 * @param fetcher - Function to fetch fresh data
 */
export async function cached<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
): Promise<T> {
    return cache.get(key, ttlMs, fetcher);
}

/**
 * Common TTL values
 */
export const TTL = {
    ONE_MINUTE: 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    TEN_MINUTES: 10 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
} as const;
