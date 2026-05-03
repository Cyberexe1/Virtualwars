import { Router, Request, Response } from 'express';
import { adminDb } from '../services/firebaseAdmin';
import { TimelineDocument, ApiError } from '../types';

const router = Router();

/**
 * GET /api/timeline/:cycleId
 * Returns a TimelineDocument by cycle ID (e.g. "india-2024").
 * Public — no auth required (timeline data is public election information).
 */
router.get('/:cycleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cycleId } = req.params;

    // Validate cycleId format to prevent path traversal
    if (!/^[a-z0-9-]+$/.test(cycleId)) {
      const error: ApiError = { error: 'Invalid cycle ID format', code: 'timeline/invalid-id' };
      res.status(400).json(error);
      return;
    }

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

// NOTE: GET /api/timeline (index listing) removed — unused by frontend.
// Frontend reads directly from Firestore client-side or uses /api/timeline/india-2024.

export default router;
