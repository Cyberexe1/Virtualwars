import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../services/firebaseAdmin';
import { ApiError } from '../types';

/**
 * Express middleware that verifies a Firebase ID token from the
 * Authorization: Bearer <token> header.
 *
 * On success: attaches req.uid and calls next()
 * On failure: returns 401 with JSON error body
 */
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: ApiError = { error: 'Missing or malformed Authorization header', code: 'auth/missing-token' };
    res.status(401).json(error);
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    // Attach uid to request for downstream handlers
    (req as Request & { uid: string }).uid = decoded.uid;
    next();
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };
    const code = firebaseError.code ?? 'auth/invalid-token';
    const error: ApiError = {
      error: 'Invalid or expired authentication token',
      code,
    };
    res.status(401).json(error);
  }
}
