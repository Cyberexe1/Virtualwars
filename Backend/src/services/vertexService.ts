import * as dotenv from 'dotenv';
import { MessageDocument } from '../types';

dotenv.config();

const PROJECT_ID = process.env.VERTEX_AI_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? '';
const LOCATION = process.env.VERTEX_AI_LOCATION ?? 'us-central1';
const MODEL = 'gemini-1.5-flash';
const TIMEOUT_MS = 10_000;

const SYSTEM_PROMPT = `You are Civic Clarity, an official non-partisan AI assistant for India's election education platform.

Your role is to help Indian citizens understand:
- Voter registration process (EPIC card, Form 6, voters.eci.gov.in)
- Election Commission of India (ECI) structure and powers
- Electronic Voting Machines (EVMs) and VVPAT systems
- Lok Sabha, Rajya Sabha, and State Assembly elections
- Model Code of Conduct (MCC)
- Nomination, campaigning, polling, and results certification process
- Postal/absentee voting for service voters
- Panchayati Raj and local body elections
- Civic rights and duties of Indian voters

Rules:
1. Always be non-partisan — never favour any political party or candidate
2. Use plain language at or below a 10th-grade reading level
3. When asked for step-by-step guidance, use numbered lists
4. If a question is outside election education, acknowledge the limitation and suggest related topics
5. Always cite the Election Commission of India (eci.gov.in) or Voter Helpline 1950 for official information
6. Respond in the same language the user writes in (English or Hindi)`;

export class VertexError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'vertex/unknown-error'
  ) {
    super(message);
    this.name = 'VertexError';
  }
}

/**
 * Converts stored MessageDocuments to Vertex AI content format.
 */
function buildHistory(history: MessageDocument[]) {
  return history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
}

/**
 * Extracts topic references from the AI response text.
 * Looks for patterns like [Topic: voter-registration] in the response.
 */
function extractTopicRefs(text: string): string[] {
  const matches = text.match(/\[Topic:\s*([a-z0-9-]+)\]/g) ?? [];
  return matches.map((m) => m.replace(/\[Topic:\s*/, '').replace(']', '').trim());
}

/**
 * Calls Vertex AI Gemini to generate a response.
 * Uses the last 20 conversation turns as context.
 *
 * @throws VertexError on API failure or timeout
 */
export async function generateResponse(
  history: MessageDocument[],
  userMessage: string
): Promise<{ text: string; topicRefs: string[] }> {
  // Dynamic import to avoid issues when Vertex AI SDK is not configured
  let VertexAI: typeof import('@google-cloud/vertexai').VertexAI;
  try {
    const module = await import('@google-cloud/vertexai');
    VertexAI = module.VertexAI;
  } catch {
    throw new VertexError('Vertex AI SDK not available', 'vertex/sdk-unavailable');
  }

  if (!PROJECT_ID) {
    throw new VertexError('VERTEX_AI_PROJECT or FIREBASE_PROJECT_ID is not configured', 'vertex/missing-config');
  }

  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  const model = vertexAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.3,
      topP: 0.8,
    },
  });

  const chat = model.startChat({ history: buildHistory(history) });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new VertexError('Request timed out after 10 seconds', 'vertex/timeout')), TIMEOUT_MS)
  );

  try {
    const result = await Promise.race([
      chat.sendMessage(userMessage),
      timeoutPromise,
    ]);

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      throw new VertexError('Empty response from Gemini', 'vertex/empty-response');
    }

    return { text, topicRefs: extractTopicRefs(text) };
  } catch (err) {
    if (err instanceof VertexError) throw err;
    const message = err instanceof Error ? err.message : 'Unknown Vertex AI error';
    throw new VertexError(message, 'vertex/api-error');
  }
}
