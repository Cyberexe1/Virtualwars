import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  linkWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Demo credentials (still available as a fallback for offline/demo mode)
// eslint-disable-next-line react-refresh/only-export-components
export const DEMO_CREDENTIALS = {
  email: 'demo@civicclarity.in',
  password: 'India@2024',
};

// Human-readable Firebase error messages
const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
};

function getErrorMessage(code) {
  return AUTH_ERROR_MESSAGES[code] ?? 'An unexpected error occurred. Please try again.';
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Voter',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        setUser(null);
      }
      setInitialising(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  // Handle redirect result on page load (for signInWithRedirect flow)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setError('');
      })
      .catch((err) => {
        if (err.code && err.code !== 'auth/no-current-user') {
          setError(getErrorMessage(err.code));
        }
      });
  }, []);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const isLocalhost = window.location.hostname === 'localhost';
      if (isLocalhost) {
        // Popup works fine on localhost
        const result = await signInWithPopup(auth, googleProvider);
        if (auth.currentUser?.isAnonymous) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) await linkWithCredential(auth.currentUser, credential);
        }
        setLoading(false);
        return true;
      } else {
        // Use redirect on production — more reliable, avoids popup-blocked issues
        await signInWithRedirect(auth, googleProvider);
        return true; // page will redirect, loading stays true
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Email / Password Sign-In ────────────────────────────────────────────────
  const signIn = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Email / Password Register ───────────────────────────────────────────────
  const register = async (email, password, displayName) => {
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      if (displayName) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(result.user, { displayName });
      }
      setLoading(false);
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Anonymous / Guest ───────────────────────────────────────────────────────
  const signInAsGuest = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
      setLoading(false);
      return true;
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  // ── Get ID Token (for API calls) ────────────────────────────────────────────
  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  // Don't block rendering — let RedirectHandler manage navigation
  // The initialising state is exposed via context for components that need it

  return (
    <AuthContext.Provider value={{
      user,
      error,
      loading,
      initialising,
      signIn,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      register,
      getIdToken,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
