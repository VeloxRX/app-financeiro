"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/** General API rate limiter: 100 requests per minute per IP */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});
/** Auth endpoint rate limiter: 10 requests per minute per IP */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas de autenticação. Tente novamente em 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map