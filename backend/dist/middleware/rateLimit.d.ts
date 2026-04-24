/** General API rate limiter: 100 requests per minute per IP */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/** Auth endpoint rate limiter: 10 requests per minute per IP */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.d.ts.map