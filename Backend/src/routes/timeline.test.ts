import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../services/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn(),
  },
}));

import { adminDb } from '../services/firebaseAdmin';

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Timeline route handlers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET /api/timeline/:cycleId returns 400 for invalid ID format', async () => {
    const { default: router } = await import('./timeline');
    const layer = router.stack.find((l) => l.route?.path === '/:cycleId');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { params: { cycleId: '../secret' } } as unknown as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'timeline/invalid-id' })
    );
  });

  it('GET /api/timeline/:cycleId returns 404 for unknown cycle', async () => {
    vi.mocked(adminDb.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ exists: false }),
      }),
    } as never);

    const { default: router } = await import('./timeline');
    const layer = router.stack.find((l) => l.route?.path === '/:cycleId');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { params: { cycleId: 'india-2099' } } as unknown as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'timeline/not-found' })
    );
  });

  it('GET /api/timeline/:cycleId returns timeline data for valid cycle', async () => {
    const timelineData = {
      year: 2024,
      label: '2024 Lok Sabha',
      events: [{ id: 'e1', title: 'Polling Day', date: '2024-04-19' }],
    };
    vi.mocked(adminDb.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: 'india-2024',
          data: () => timelineData,
        }),
      }),
    } as never);

    const { default: router } = await import('./timeline');
    const layer = router.stack.find((l) => l.route?.path === '/:cycleId');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { params: { cycleId: 'india-2024' } } as unknown as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ year: 2024, label: '2024 Lok Sabha' })
    );
  });
});
