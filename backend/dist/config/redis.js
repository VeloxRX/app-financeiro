"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.getOrSet = getOrSet;
exports.invalidatePattern = invalidatePattern;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
exports.redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});
exports.redis.on('connect', () => {
    console.log('✅ Redis connected');
});
/** Get cached value or compute and cache it */
async function getOrSet(key, ttlSeconds, fn) {
    const cached = await exports.redis.get(key);
    if (cached)
        return JSON.parse(cached);
    const value = await fn();
    await exports.redis.setex(key, ttlSeconds, JSON.stringify(value));
    return value;
}
/** Invalidate cache keys matching a pattern */
async function invalidatePattern(pattern) {
    const keys = await exports.redis.keys(pattern);
    if (keys.length > 0) {
        await exports.redis.del(...keys);
    }
}
//# sourceMappingURL=redis.js.map