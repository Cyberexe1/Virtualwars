import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

// Mock firebaseAdmin
vi.mock('../services/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn(),
  },
}));

import { adminDb } from '../services/firebaseAdmin';

// Helper to create mock Firestore query chain
function mockFirestoreQuery(docs: object[]) {
  const snapshot = {
    docs: docs.map((data) => ({ id: 'test-id', data: () => data })),
  };
  const query = {
    where: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue(snapshot),
  };
  vi.mocked(adminDb.collection).mockReturnValue(query as never);
  return query;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Topics route handlers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET /api/topics returns array of topics', async () => {
    mockFirestoreQuery([
      { title: 'Voter Registration', category: 'registration', locale: 'en' },
      { title: 'EVM Basics', category: 'ballot', locale: 'en' },
    ]);

    // Dynamically import after mock is set up
    const { default: router } = await import('./topics');
    const layer = router.stack.find((l) => l.route?.path === '/');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { query: {} } as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Voter Registration' }),
      ])
    );
  });

  it('GET /api/topics/:topicId returns 400 for invalid ID format', async () => {
    const { default: router } = await import('./topics');
    const layer = router.stack.find((l) => l.route?.path === '/:topicId');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { params: { topicId: '../etc/passwd' } } as unknown as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'topics/invalid-id' })
    );
  });

  it('GET /api/topics/:topicId returns 404 for unknown topic', async () => {
    const notFoundDoc = { exists: false, id: 'unknown', data: () => ({}) };
    vi.mocked(adminDb.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(notFoundDoc),
      }),
    } as never);

    const { default: router } = await import('./topics');
    const layer = router.stack.find((l) => l.route?.path === '/:topicId');
    const handler = layer?.route?.stack[0]?.handle;

    const req = { params: { topicId: 'nonexistent-topic' } } as unknown as Request;
    const res = mockRes();
    await handler?.(req, res as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'topics/not-found' })
    );
  });
});
