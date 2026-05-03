import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { adminDb } from '../services/firebaseAdmin';
import { verifyToken } from '../middleware/verifyToken';
import { sanitizeMiddleware } from '../middleware/sanitize';
import { generateResponse, VertexError } from '../services/vertexService';
import { MessageDocument, ApiError, ChatResponse } from '../types';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const router = Router();

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'message is required').max(500, 'message must be 500 characters or fewer'),
});

const MAX_HISTORY_TURNS = 20;

const FALLBACK_MESSAGE =
  "I'm sorry, I'm having trouble connecting to my knowledge base right now. " +
  "Please try again in a moment. For urgent election information, call the " +
  "Voter Helpline at 1950 or visit eci.gov.in.";

/**
 * POST /api/chat
 * Requires: Firebase ID token (verifyToken) + sanitized message body
 *
 * Flow:
 * 1. Validate & sanitize input
 * 2. Read last 20 messages from Firestore conversation history
 * 3. Call Vertex AI Gemini with history + new message
 * 4. Batch-write user + assistant messages to Firestore
 * 5. Return { response, topicRefs }
 */
router.post(
  '/',
  verifyToken,
  sanitizeMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const uid = (req as Request & { uid: string }).uid;

    // Validate body
    const parseResult = ChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const error: ApiError = {
        error: parseResult.error.errors.map((e) => e.message).join(', '),
        code: 'chat/invalid-body',
      };
      res.status(400).json(error);
      return;
    }

    const { message } = parseResult.data;

    try {
      // Fetch conversation history (last MAX_HISTORY_TURNS messages)
      const messagesRef = adminDb
        .collection('conversations')
        .doc(uid)
        .collection('messages');

      const historySnapshot = await messagesRef
        .orderBy('timestamp', 'desc')
        .limit(MAX_HISTORY_TURNS)
        .get();

      const history: MessageDocument[] = historySnapshot.docs
        .map((doc) => doc.data() as MessageDocument)
        .reverse(); // chronological order

      // Call Vertex AI
      const { text, topicRefs } = await generateResponse(history, message);

      // Batch-write both messages to Firestore
      const now = Timestamp.now();
      const batch = adminDb.batch();

      const userMsgRef = messagesRef.doc();
      batch.set(userMsgRef, {
        role: 'user',
        content: message,
        timestamp: now,
        topicRefs: [],
      } satisfies MessageDocument);

      const assistantMsgRef = messagesRef.doc();
      batch.set(assistantMsgRef, {
        role: 'assistant',
        content: text,
        timestamp: Timestamp.fromMillis(now.toMillis() + 1), // ensure ordering
        topicRefs,
      } satisfies MessageDocument);

      // Increment questionsAsked counter
      batch.set(
        adminDb.collection('users').doc(uid),
        { questionsAsked: FieldValue.increment(1), lastActiveAt: now },
        { merge: true }
      );

      await batch.commit();

      const response: ChatResponse = { response: text, topicRefs };
      res.json(response);
    } catch (err) {
      if (err instanceof VertexError) {
        console.error(`[Chat] Vertex AI error (${err.code}):`, err.message);
        const response: ChatResponse = { response: FALLBACK_MESSAGE, topicRefs: [] };
        res.status(502).json(response);
        return;
      }
      console.error('[Chat] Unexpected error:', err);
      const error: ApiError = { error: 'Internal server error', code: 'chat/internal-error' };
      res.status(500).json(error);
    }
  }
);

export default router;
