import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Code splitting: each page loads only when navigated to ──────────────────
const Landing     = lazy(() => import('./pages/Landing'));
const Signup      = lazy(() => import('./pages/Signup'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Chat        = lazy(() => import('./pages/Chat'));
const Timeline    = lazy(() => import('./pages/Timeline'));
const Topics      = lazy(() => import('./pages/Topics'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));

// ── Page loading fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[36px] animate-spin">
          progress_activity
        </span>
        <p className="text-[14px] text-on-surface-variant font-['Lexend']">Loading...</p>
      </div>
    </div>
  );
}

// ── Protected route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signup" replace />;
}

// ── Auto-redirect after Google sign-in redirect flow ─────────────────────────
function RedirectHandler() {
  const { user, initialising } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialising) return; // wait for Firebase to resolve auth state
    if (user) {
      const path = window.location.pathname;
      // Redirect to dashboard from any public page after login
      if (path === '/signup' || path === '/' || path === '/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, initialising, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RedirectHandler />
      <Routes>
        <Route path="/"                element={<Landing />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/timeline"        element={<Timeline />} />
        <Route path="/topics"          element={<Topics />} />
        <Route path="/topics/:topicId" element={<TopicDetail />} />
        <Route path="/chat"            element={<Chat />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
