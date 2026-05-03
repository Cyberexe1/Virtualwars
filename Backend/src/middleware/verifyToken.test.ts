import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './verifyToken';

// Mock firebaseAdmin module
vi.mock('../services/firebaseAdmin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
}));

import { adminAuth } from '../services/firebaseAdmin';

function mockReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('verifyToken middleware', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    await verifyToken(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'auth/missing-token' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const req = mockReq('Basic abc123');
    const res = mockRes();
    await verifyToken(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches uid and calls next() for a valid token', async () => {
    vi.mocked(adminAuth.verifyIdToken).mockResolvedValueOnce({ uid: 'user-123' } as never);
    const req = mockReq('Bearer valid-token');
    const res = mockRes();
    await verifyToken(req as Request, res as Response, next);
    expect((req as Request & { uid: string }).uid).toBe('user-123');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid/expired token', async () => {
    vi.mocked(adminAuth.verifyIdToken).mockRejectedValueOnce({
      code: 'auth/id-token-expired',
      message: 'Token expired',
    });
    const req = mockReq('Bearer expired-token');
    const res = mockRes();
    await verifyToken(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'auth/id-token-expired' })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
