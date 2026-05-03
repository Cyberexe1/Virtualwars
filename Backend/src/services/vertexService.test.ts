import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VertexError } from './vertexService';

describe('VertexError', () => {
  it('is an instance of Error', () => {
    const err = new VertexError('test message', 'vertex/test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(VertexError);
  });

  it('has correct name, message and code', () => {
    const err = new VertexError('Timeout', 'vertex/timeout');
    expect(err.name).toBe('VertexError');
    expect(err.message).toBe('Timeout');
    expect(err.code).toBe('vertex/timeout');
  });

  it('uses default code when not provided', () => {
    const err = new VertexError('Unknown');
    expect(err.code).toBe('vertex/unknown-error');
  });
});

describe('generateResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERTEX_AI_PROJECT;
    delete process.env.FIREBASE_PROJECT_ID;
  });

  it('throws VertexError when project ID is not configured', async () => {
    const { generateResponse } = await import('./vertexService');
    await expect(
      generateResponse([], 'What is EVM?')
    ).rejects.toThrow(VertexError);
  });
});
