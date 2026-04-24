import rateLimit from 'express-rate-limit';

/** General API rate limiter: 100 requests per minute per IP */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Auth endpoint rate limiter: 10 requests per minute per IP */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});
