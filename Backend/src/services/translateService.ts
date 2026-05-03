import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY ?? '';
const TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'gu', label: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
  { code: 'en', label: 'English', name: 'English' },
];

export class TranslateError extends Error {
  constructor(message: string, public readonly code: string = 'translate/error') {
    super(message);
    this.name = 'TranslateError';
  }
}

/**
 * Translates an array of text strings using Google Cloud Translation API v2.
 * Batches all strings in a single API call for efficiency.
 *
 * @param texts   Array of strings to translate
 * @param target  Target language code (e.g. 'hi', 'ta', 'te')
 * @param source  Source language code (default: 'en')
 * @returns       Array of translated strings in the same order
 */
export async function translateTexts(
  texts: string[],
  target: string,
  source = 'en'
): Promise<string[]> {
  if (!API_KEY) {
    throw new TranslateError('GOOGLE_TRANSLATE_API_KEY is not configured', 'translate/missing-key');
  }

  if (target === source) return texts; // no-op

  const url = `${TRANSLATE_URL}?key=${API_KEY}`;

  const body = {
    q: texts,
    source,
    target,
    format: 'text',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`;
    throw new TranslateError(`Translation API error: ${msg}`, 'translate/api-error');
  }

  const data = await response.json() as {
    data: { translations: Array<{ translatedText: string }> }
  };

  return data.data.translations.map(t => t.translatedText);
}

/**
 * Translates a full topic's Markdown content line by line.
 * Preserves Markdown syntax (headings, bullets, factsheet blocks).
 */
export async function translateTopicContent(
  contentMd: string,
  targetLang: string
): Promise<string> {
  if (targetLang === 'en') return contentMd;

  // Split into non-empty lines, translate in one batch, reassemble
  const lines = contentMd.split('\n');
  const nonEmptyIndices: number[] = [];
  const textsToTranslate: string[] = [];

  lines.forEach((line, i) => {
    if (line.trim()) {
      nonEmptyIndices.push(i);
      textsToTranslate.push(line);
    }
  });

  if (textsToTranslate.length === 0) return contentMd;

  const translated = await translateTexts(textsToTranslate, targetLang);

  const result = [...lines];
  nonEmptyIndices.forEach((lineIdx, i) => {
    result[lineIdx] = translated[i] ?? lines[lineIdx];
  });

  return result.join('\n');
}
