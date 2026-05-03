import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// ── Module-level cache — survives re-renders, cleared on page refresh ────────
const topicsCache = {
  all: null,           // all topics array
  byId: new Map(),     // topicId → topic object
  timestamp: 0,        // when cache was populated
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
  return topicsCache.all !== null && Date.now() - topicsCache.timestamp < CACHE_TTL_MS;
}

/**
 * Fetches all topics from Firestore with in-memory caching.
 * Subsequent calls within 5 minutes return cached data — no Firestore reads.
 */
export function useTopics({ category, locale } = {}) {
  const [topics, setTopics] = useState(() => {
    // Initialise from cache immediately (no loading flash)
    if (isCacheValid() && !category && !locale) return topicsCache.all;
    return [];
  });
  const [loading, setLoading] = useState(!isCacheValid() || !!category || !!locale);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use cache for unfiltered requests
    if (!category && !locale && isCacheValid()) {
      setTimeout(() => {
        setTopics(topicsCache.all);
        setLoading(false);
      }, 0);
      return;
    }

    const q = collection(db, 'topics');
    const constraints = [];
    if (locale)   constraints.push(where('locale', '==', locale));
    const firestoreQuery = constraints.length > 0 ? query(q, ...constraints) : q;

    getDocs(firestoreQuery)
      .then((snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Populate cache for unfiltered requests
        if (!category && !locale) {
          topicsCache.all = data;
          topicsCache.timestamp = Date.now();
          data.forEach(t => topicsCache.byId.set(t.id, t));
        }

        setTopics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useTopics] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [category, locale]);

  return { topics, loading, error };
}

/**
 * Fetches a single topic by ID — uses cache first, falls back to Firestore.
 */
export function useTopic(topicId) {
  const [topic, setTopic] = useState(() => topicsCache.byId.get(topicId) ?? null);
  const [loading, setLoading] = useState(!topicsCache.byId.has(topicId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topicId) return;

    // Return from cache immediately
    if (topicsCache.byId.has(topicId)) {
      setTimeout(() => {
        setTopic(topicsCache.byId.get(topicId));
        setLoading(false);
      }, 0);
      return;
    }

    getDoc(doc(db, 'topics', topicId))
      .then((d) => {
        if (d.exists()) {
          const t = { id: d.id, ...d.data() };
          topicsCache.byId.set(topicId, t); // cache for future use
          setTopic(t);
        } else {
          setError('Topic not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useTopic] Firestore error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [topicId]);

  return { topic, loading, error };
}
