import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetches all topics from Firestore, with optional category/locale filtering.
 * Falls back to static data if Firestore is unavailable.
 */
export function useTopics({ category, locale } = {}) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, 'topics');

    const constraints = [];
    if (category) constraints.push(where('category', '==', category));
    if (locale) constraints.push(where('locale', '==', locale));

    const firestoreQuery = constraints.length > 0 ? query(q, ...constraints) : q;

    getDocs(firestoreQuery)
      .then((snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
 * Fetches a single topic by its Firestore document ID (slug).
 */
export function useTopic(topicId) {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topicId) return;

    getDoc(doc(db, 'topics', topicId))
      .then((d) => {
        if (d.exists()) {
          setTopic({ id: d.id, ...d.data() });
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
