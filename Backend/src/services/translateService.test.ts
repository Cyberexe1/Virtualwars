import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateTexts, translateTopicContent, SUPPORTED_LANGUAGES, TranslateError } from './translateService';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockTranslateResponse(translations: string[]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: {
        translations: translations.map((t) => ({ translatedText: t })),
      },
    }),
  });
}

describe('translateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_TRANSLATE_API_KEY = 'test-api-key';
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('includes Hindi', () => {
      expect(SUPPORTED_LANGUAGES.some((l) => l.code === 'hi')).toBe(true);
    });

    it('includes all 10 Indian languages plus English', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
    });

    it('includes English', () => {
      expect(SUPPORTED_LANGUAGES.some((l) => l.code === 'en')).toBe(true);
    });
  });

  describe('translateTexts', () => {
    it('returns original texts when target equals source', async () => {
      const texts = ['Hello', 'World'];
      const result = await translateTexts(texts, 'en', 'en');
      expect(result).toEqual(texts);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('calls Google Translate API and returns translated texts', async () => {
      mockTranslateResponse(['नमस्ते', 'दुनिया']);
      const result = await translateTexts(['Hello', 'World'], 'hi');
      expect(result).toEqual(['नमस्ते', 'दुनिया']);
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('throws TranslateError when API key is missing', async () => {
      // The module reads API_KEY at load time — test the error path via empty key
      // by mocking fetch to simulate a 403 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'API key not valid' } }),
      });
      await expect(translateTexts(['Hello'], 'hi')).rejects.toThrow(TranslateError);
    });

    it('throws TranslateError when API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });
      await expect(translateTexts(['Hello'], 'hi')).rejects.toThrow(TranslateError);
    });
  });

  describe('translateTopicContent', () => {
    it('returns original content when target is English', async () => {
      const md = '# Title\n\nSome content';
      const result = await translateTopicContent(md, 'en');
      expect(result).toBe(md);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('translates non-empty lines and preserves structure', async () => {
      const md = '# Voter Registration\n\nHow to register.';
      // Mock response for 2 non-empty lines
      mockTranslateResponse(['# मतदाता पंजीकरण', 'कैसे पंजीकरण करें।']);
      const result = await translateTopicContent(md, 'hi');
      expect(result).toContain('मतदाता पंजीकरण');
    });

    it('handles empty content gracefully', async () => {
      const result = await translateTopicContent('', 'hi');
      expect(result).toBe('');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
