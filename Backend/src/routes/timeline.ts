import { Router, Request, Response } from 'express';
import { adminDb } from '../services/firebaseAdmin';
import { TimelineDocument, ApiError } from '../types';

const router = Router();

/**
 * GET /api/timeline/:cycleId
 * Returns a TimelineDocument by cycle ID (e.g. "india-2024").
 * Public — no auth required.
 */
router.get('/:cycleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cycleId } = req.params;
    const doc = await adminDb.collection('timelines').doc(cycleId).get();

    if (!doc.exists) {
      const error: ApiError = {
        error: `Timeline '${cycleId}' not found`,
        code: 'timeline/not-found',
      };
      res.status(404).json(error);
      return;
    }

    res.json({ id: doc.id, ...(doc.data() as TimelineDocument) });
  } catch (err) {
    console.error('[Timeline] GET /api/timeline/:cycleId error:', err);
    const error: ApiError = { error: 'Failed to fetch timeline', code: 'timeline/fetch-error' };
    res.status(500).json(error);
  }
});

/**
 * GET /api/timeline
 * Returns all available timeline cycles (index).
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await adminDb.collection('timelines').get();
    const timelines = snapshot.docs.map((doc) => ({
      id: doc.id,
      year: (doc.data() as TimelineDocument).year,
      label: (doc.data() as TimelineDocument).label,
    }));
    res.json(timelines);
  } catch (err) {
    console.error('[Timeline] GET /api/timeline error:', err);
    const error: ApiError = { error: 'Failed to fetch timelines', code: 'timeline/fetch-error' };
    res.status(500).json(error);
  }
});

export default router;
