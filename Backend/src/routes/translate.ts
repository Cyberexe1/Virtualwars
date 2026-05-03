import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  translateTopicContent,
  translateTexts,
  SUPPORTED_LANGUAGES,
  TranslateError,
} from '../services/translateService';
import { ApiError } from '../types';

const router = Router();

const TranslateSchema = z.object({
  text: z.string().min(1, 'text is required').max(10000, 'text too long'),
  targetLang: z.string().min(2).max(5),
  isMarkdown: z.boolean().optional().default(false),
});

/**
 * GET /api/translate/languages
 * Returns the list of supported languages.
 */
router.get('/languages', (_req: Request, res: Response) => {
  res.json(SUPPORTED_LANGUAGES);
});

/**
 * POST /api/translate
 * Translates text or Markdown content to the target language.
 * Body: { text: string, targetLang: string, isMarkdown?: boolean }
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
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
});

export default router;
