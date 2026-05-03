import { Request, Response, NextFunction } from 'express';

const MAX_LENGTH = 500;

/**
 * Sanitises a raw string input:
 * 1. Strips all HTML tags
 * 2. Removes characters outside the safe set [\w\s.,?!'-]
 * 3. Trims leading/trailing whitespace
 * 4. Truncates to MAX_LENGTH characters
 *
 * Property 1: sanitizeInput(sanitizeInput(s)) === sanitizeInput(s)  [idempotent]
 * Tag: // Feature: election-process-education, Property 1: sanitize idempotency
 */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script blocks entirely
    .replace(/<[^>]*>/g, '')                    // strip remaining HTML tags
    .replace(/[^\w\s.,?!'\-]/g, '')             // allow only safe characters
    .trim()
    .slice(0, MAX_LENGTH);
}

/**
 * Express middleware that sanitises req.body.message in place.
 * Passes through if message is absent (route handler validates presence).
 */
export function sanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body.message === 'string') {
    req.body.message = sanitizeInput(req.body.message);
  }
  next();
}
