import Redis from 'ioredis';
export declare const redis: Redis;
/** Get cached value or compute and cache it */
export declare function getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T>;
/** Invalidate cache keys matching a pattern */
export declare function invalidatePattern(pattern: string): Promise<void>;
//# sourceMappingURL=redis.d.ts.map