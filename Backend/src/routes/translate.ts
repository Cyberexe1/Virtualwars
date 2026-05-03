import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  translateTopicContent,
  translateTexts,
  SUPPORTED_LANGUAGES,
  TranslateError,
} from '../services/translateService';
import { verifyToken } from '../middleware/verifyToken';
import { rateLimit } from '../middleware/rateLimit';
import { ApiError } from '../types';

const router = Router();

// Validate target language is in our supported list
const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

const TranslateSchema = z.object({
  text: z.string().min(1, 'text is required').max(5000, 'text too long (max 5000 chars)'),
  targetLang: z.string().min(2).max(5).refine(
    (lang) => SUPPORTED_CODES.includes(lang),
    { message: 'Unsupported target language' }
  ),
  isMarkdown: z.boolean().optional().default(false),
});

/**
 * POST /api/translate
 * Translates text or Markdown content to the target language.
 * Requires: Firebase ID token (prevents abuse of Translation API quota).
 * Rate limited: 20 requests per IP per minute.
 * Body: { text: string, targetLang: string, isMarkdown?: boolean }
 */
router.post(
  '/',
  verifyToken,
  rateLimit(20, 60 * 1000, 'Too many translation requests. Please wait a moment.'),
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = TranslateSchema.safeParse(req.body);

    if (!parseResult.success) {
      const error: ApiError = {
        error: parseResult.error.errors[0]?.message ?? 'Invalid request body',
        code: 'translate/invalid-body',
      };
      res.status(400).json(error);
      return;
    }

    const { text, targetLang, isMarkdown } = parseResult.data;

    try {
      let translated: string;

      if (isMarkdown) {
        translated = await translateTopicContent(text, targetLang);
      } else {
        const results = await translateTexts([text], targetLang);
        translated = results[0] ?? text;
      }

      res.json({ translated, targetLang, originalLength: text.length });
    } catch (err) {
      if (err instanceof TranslateError) {
        console.error(`[Translate] ${err.code}:`, err.message);
        const error: ApiError = { error: err.message, code: err.code };
        res.status(err.code === 'translate/missing-key' ? 503 : 502).json(error);
        return;
      }
      console.error('[Translate] Unexpected error:', err);
      const error: ApiError = { error: 'Translation failed', code: 'translate/internal-error' };
      res.status(500).json(error);
    }
  }
);

// NOTE: GET /api/translate/languages removed — unused by frontend.
// Language list is hardcoded in TopicDetail.jsx for performance (no network call needed).

export default router;
