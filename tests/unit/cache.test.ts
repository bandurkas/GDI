import { cached, cache, TTL } from '@/lib/cache';

describe('Caching System', () => {
    beforeEach(() => {
        cache.clear();
    });

    describe('cached function', () => {
        it('should cache function results', async () => {
            let callCount = 0;
            const fetcher = async () => {
                callCount++;
                return 'test-data';
            };

            // First call - should execute fetcher
            const result1 = await cached('test-key', TTL.ONE_MINUTE, fetcher);
            expect(result1).toBe('test-data');
            expect(callCount).toBe(1);

            // Second call - should use cache
            const result2 = await cached('test-key', TTL.ONE_MINUTE, fetcher);
            expect(result2).toBe('test-data');
            expect(callCount).toBe(1); // Not called again
        });

        it('should expire cache after TTL', async () => {
            let callCount = 0;
            const fetcher = async () => {
                callCount++;
                return `data-${callCount}`;
            };

            // First call
            const result1 = await cached('test-key', 100, fetcher); // 100ms TTL
            expect(result1).toBe('data-1');

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 150));

            // Should fetch again
            const result2 = await cached('test-key', 100, fetcher);
            expect(result2).toBe('data-2');
            expect(callCount).toBe(2);
        });

        it('should handle different keys separately', async () => {
            const fetcher1 = async () => 'data-1';
            const fetcher2 = async () => 'data-2';

            const result1 = await cached('key-1', TTL.ONE_MINUTE, fetcher1);
            const result2 = await cached('key-2', TTL.ONE_MINUTE, fetcher2);

            expect(result1).toBe('data-1');
            expect(result2).toBe('data-2');
        });
    });

    describe('cache.invalidate', () => {
        it('should invalidate specific key', async () => {
            let callCount = 0;
            const fetcher = async () => {
                callCount++;
                return `data-${callCount}`;
            };

            // Cache data
            await cached('test-key', TTL.ONE_MINUTE, fetcher);
            expect(callCount).toBe(1);

            // Invalidate
            cache.invalidate('test-key');

            // Should fetch again
            await cached('test-key', TTL.ONE_MINUTE, fetcher);
            expect(callCount).toBe(2);
        });
    });

    describe('cache.invalidatePattern', () => {
        it('should invalidate keys matching pattern', async () => {
            const fetcher = async (key: string) => `data-${key}`;

            // Cache multiple keys
            await cached('products:all', TTL.ONE_MINUTE, () => fetcher('all'));
            await cached('products:active', TTL.ONE_MINUTE, () => fetcher('active'));
            await cached('users:all', TTL.ONE_MINUTE, () => fetcher('users'));

            // Invalidate products
            cache.invalidatePattern('products:');

            const stats = cache.stats();
            expect(stats.size).toBe(1); // Only users:all remains
            expect(stats.keys).toContain('users:all');
            expect(stats.keys).not.toContain('products:all');
        });
    });

    describe('cache.clear', () => {
        it('should clear all cache', async () => {
            await cached('key-1', TTL.ONE_MINUTE, async () => 'data-1');
            await cached('key-2', TTL.ONE_MINUTE, async () => 'data-2');

            cache.clear();

            const stats = cache.stats();
            expect(stats.size).toBe(0);
        });
    });

    describe('cache.stats', () => {
        it('should return cache statistics', async () => {
            await cached('key-1', TTL.ONE_MINUTE, async () => 'data-1');
            await cached('key-2', TTL.ONE_MINUTE, async () => 'data-2');

            const stats = cache.stats();
            expect(stats.size).toBe(2);
            expect(stats.keys).toEqual(['key-1', 'key-2']);
        });
    });
});
