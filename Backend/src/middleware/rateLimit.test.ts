import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { rateLimit } from './rateLimit';

function mockReq(ip = '127.0.0.1'): Partial<Request> {
  return { ip };
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('rateLimit middleware', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests within the limit', () => {
    const limiter = rateLimit(3, 60000, 'Too many requests');
    const req = mockReq('10.0.0.1');
    const res = mockRes();

    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks requests exceeding the limit', () => {
    const limiter = rateLimit(2, 60000, 'Rate limit exceeded');
    const req = mockReq('10.0.0.2');
    const res = mockRes();

    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next); // 3rd — should be blocked

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'rate-limit/exceeded' })
    );
  });

  it('tracks limits per IP independently', () => {
    const limiter = rateLimit(1, 60000, 'Too many');
    const req1 = mockReq('192.168.1.1');
    const req2 = mockReq('192.168.1.2');
    const res = mockRes();

    limiter(req1 as Request, res as Response, next);
    limiter(req2 as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(2); // each IP gets its own counter
  });

  it('returns retryAfter in the error response', () => {
    const limiter = rateLimit(1, 60000, 'Slow down');
    const req = mockReq('10.0.0.3');
    const res = mockRes();

    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next); // blocked

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ retryAfter: expect.any(Number) })
    );
  });
});
