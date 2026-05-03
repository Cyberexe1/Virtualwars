import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter.
 * For production, replace with redis-based rate limiting.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Creates a rate limiter middleware.
 * @param maxRequests  Max requests allowed per window
 * @param windowMs     Time window in milliseconds
 * @param message      Error message when limit exceeded
 */
export function rateLimit(maxRequests: number, windowMs: number, message: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      res.status(429).json({
        error: message,
        code: 'rate-limit/exceeded',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }

    entry.count++;
    next();
  };
}

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);
