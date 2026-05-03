import { Router, Request, Response } from 'express';
import { adminDb } from '../services/firebaseAdmin';
import { TopicDocument, ApiError } from '../types';

const router = Router();

/**
 * GET /api/topics
 * Returns all topics, optionally filtered by ?category= and ?locale=
 * Public — no auth required.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection('topics');

    const { category, locale } = req.query;

    if (category && typeof category === 'string') {
      query = query.where('category', '==', category);
    }
    if (locale && typeof locale === 'string') {
      query = query.where('locale', '==', locale);
    }

    const snapshot = await query.get();
    const topics = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TopicDocument),
    }));

    res.json(topics);
  } catch (err) {
    console.error('[Topics] GET /api/topics error:', err);
    const error: ApiError = { error: 'Failed to fetch topics', code: 'topics/fetch-error' };
    res.status(500).json(error);
  }
});

/**
 * GET /api/topics/:topicId
 * Returns a single topic by Firestore document ID.
 * Public — no auth required.
 */
router.get('/:topicId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;

    // Validate topicId format to prevent path traversal / injection
    if (!/^[a-z0-9-]+$/.test(topicId)) {
      const error: ApiError = { error: 'Invalid topic ID format', code: 'topics/invalid-id' };
      res.status(400).json(error);
      return;
    }

    const doc = await adminDb.collection('topics').doc(topicId).get();

    if (!doc.exists) {
      const error: ApiError = { error: `Topic '${topicId}' not found`, code: 'topics/not-found' };
      res.status(404).json(error);
      return;
    }

    res.json({ id: doc.id, ...(doc.data() as TopicDocument) });
  } catch (err) {
    console.error('[Topics] GET /api/topics/:id error:', err);
    const error: ApiError = { error: 'Failed to fetch topic', code: 'topics/fetch-error' };
    res.status(500).json(error);
  }
});

export default router;
