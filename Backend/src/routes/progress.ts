import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { adminDb } from '../services/firebaseAdmin';
import { verifyToken } from '../middleware/verifyToken';
import { ApiError, ProgressUpdateRequest } from '../types';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

// All progress routes require authentication
router.use(verifyToken);

const ProgressUpdateSchema = z.object({
  topicId: z.string().min(1, 'topicId is required'),
  completed: z.boolean(),
});

/**
 * GET /api/progress
 * Returns the authenticated user's progress map from Firestore.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = (req as Request & { uid: string }).uid;
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // Return empty progress for new users
      res.json({ progress: {}, topicsViewed: 0, questionsAsked: 0, badgesEarned: [] });
      return;
    }

    const data = userDoc.data() ?? {};
    res.json({
      progress: data.progress ?? {},
      topicsViewed: data.topicsViewed ?? 0,
      questionsAsked: data.questionsAsked ?? 0,
      badgesEarned: data.badgesEarned ?? [],
    });
  } catch (err) {
    console.error('[Progress] GET /api/progress error:', err);
    const error: ApiError = { error: 'Failed to fetch progress', code: 'progress/fetch-error' };
    res.status(500).json(error);
  }
});

/**
 * POST /api/progress
 * Updates a topic's completion status for the authenticated user.
 * Body: { topicId: string, completed: boolean }
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = (req as Request & { uid: string }).uid;

    // Validate request body
    const parseResult = ProgressUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const error: ApiError = {
        error: parseResult.error.errors.map((e) => e.message).join(', '),
        code: 'progress/invalid-body',
      };
      res.status(400).json(error);
      return;
    }

    const { topicId, completed }: ProgressUpdateRequest = parseResult.data;
    const userRef = adminDb.collection('users').doc(uid);
    const now = new Date();

    // Batch write: update progress + increment topicsViewed counter
    const batch = adminDb.batch();
    batch.set(
      userRef,
      {
        [`progress.${topicId}`]: {
          completed,
          completedAt: completed ? now : null,
        },
        topicsViewed: FieldValue.increment(completed ? 1 : 0),
        lastActiveAt: now,
      },
      { merge: true }
    );
    await batch.commit();

    // Return updated progress
    const updatedDoc = await userRef.get();
    const data = updatedDoc.data() ?? {};
    res.json({
      progress: data.progress ?? {},
      topicsViewed: data.topicsViewed ?? 0,
    });
  } catch (err) {
    console.error('[Progress] POST /api/progress error:', err);
    const error: ApiError = { error: 'Failed to update progress', code: 'progress/update-error' };
    res.status(500).json(error);
  }
});

export default router;
