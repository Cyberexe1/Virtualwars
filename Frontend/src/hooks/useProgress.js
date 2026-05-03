import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Reads progress from localStorage (set by TopicDetail page-by-page reader).
 */
function getLocalProgress() {
  try {
    return JSON.parse(localStorage.getItem('civic_progress') ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Syncs localStorage progress to Firestore for the authenticated user.
 * Called once on dashboard mount.
 */
async function syncLocalToFirestore(uid) {
  if (!uid) return;
  const local = getLocalProgress();
  const completedIds = Object.entries(local)
    .filter(([, v]) => v?.completed)
    .map(([id]) => id);

  if (completedIds.length === 0) return;

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  // Build progress map
  const progressMap = {};
  for (const [topicId, data] of Object.entries(local)) {
    progressMap[`progress.${topicId}`] = {
      completed: data.completed ?? false,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
    };
  }

  if (snap.exists()) {
    await updateDoc(userRef, {
      ...progressMap,
      topicsViewed: completedIds.length,
      lastActiveAt: serverTimestamp(),
    });
  } else {
    // Create user document
    await setDoc(userRef, {
      progress: Object.fromEntries(
        Object.entries(local).map(([id, data]) => [
          id,
          { completed: data.completed ?? false, completedAt: data.completedAt ? new Date(data.completedAt) : null },
        ])
      ),
      topicsViewed: completedIds.length,
      questionsAsked: 0,
      badgesEarned: [],
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  }
}

/**
 * Hook: loads user progress from localStorage + Firestore.
 * Merges both sources — localStorage is the source of truth for reading progress,
 * Firestore is used for persistence across devices.
 */
export function useProgress(uid) {
  const [progress, setProgress] = useState({});
  const [topicsViewed, setTopicsViewed] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    // Always read localStorage first (immediate, no network)
    const local = getLocalProgress();
    const localCompleted = Object.entries(local).filter(([, v]) => v?.completed);

    setProgress(local);
    setTopicsViewed(localCompleted.length);
    setLoading(false);

    // Then sync to/from Firestore if user is logged in
    if (!uid) return;

    try {
      // Sync local → Firestore
      await syncLocalToFirestore(uid);

      // Read back from Firestore (may have data from other devices)
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        const firestoreProgress = data.progress ?? {};

        // Merge: prefer completed=true from either source
        const merged = { ...local };
        for (const [topicId, fp] of Object.entries(firestoreProgress)) {
          if (fp.completed && !merged[topicId]?.completed) {
            merged[topicId] = fp;
          }
        }

        // Save merged back to localStorage
        localStorage.setItem('civic_progress', JSON.stringify(merged));

        const mergedCompleted = Object.values(merged).filter(v => v?.completed).length;
        setProgress(merged);
        setTopicsViewed(Math.max(mergedCompleted, data.topicsViewed ?? 0));
        setQuestionsAsked(data.questionsAsked ?? 0);
      }
    } catch (err) {
      console.error('[useProgress] Firestore sync error:', err);
      // Fall back to localStorage data already set above
    }
  }, [uid]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { progress, topicsViewed, questionsAsked, loading, reload: loadProgress };
}
