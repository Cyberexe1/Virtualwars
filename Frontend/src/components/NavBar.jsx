import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-[#DEE2E6] shadow-sm">
      <nav className="flex justify-between items-center h-16 max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">account_balance</span>
            <span className="text-xl font-bold text-[#004492] uppercase tracking-tighter font-['Public_Sans']">
              Civic Clarity
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-6">
            <Link
              to="/topics"
              className={`font-['Public_Sans'] text-[15px] font-medium tracking-wide transition-colors duration-200 pb-1 ${
                isActive('/topics')
                  ? 'text-[#004492] border-b-2 border-[#004492]'
                  : 'text-gray-600 hover:text-[#004492]'
              }`}
            >
              Topics
            </Link>
            <Link
              to="/timeline"
              className={`font-['Public_Sans'] text-[15px] font-medium tracking-wide transition-colors duration-200 pb-1 ${
                isActive('/timeline')
                  ? 'text-[#004492] border-b-2 border-[#004492]'
                  : 'text-gray-600 hover:text-[#004492]'
              }`}
            >
              Timeline
            </Link>
            <Link
              to="/chat"
              className={`font-['Public_Sans'] text-[15px] font-medium tracking-wide transition-colors duration-200 pb-1 ${
                isActive('/chat')
                  ? 'text-[#004492] border-b-2 border-[#004492]'
                  : 'text-gray-600 hover:text-[#004492]'
              }`}
            >
              Ask AI
            </Link>
          </div>
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!user.isAnonymous && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full">
                  <span className="material-symbols-outlined text-secondary text-sm">workspace_premium</span>
                  <span className="text-[12px] font-bold text-secondary uppercase tracking-widest">
                    {user.displayName}
                  </span>
                </div>
              )}
              {/* Show "Back to Home" when on dashboard pages, "Dashboard" when on public pages */}
              {isActive('/dashboard') || isActive('/chat') || isActive('/timeline') || isActive('/topics') ? (
                <Link
                  to="/"
                  className="hidden md:inline-flex items-center gap-1 bg-surface-container-low text-primary border border-[#DEE2E6] px-4 py-2 rounded-lg font-medium text-sm hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Home
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="hidden md:inline-flex items-center gap-1 bg-primary-container text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="font-['Public_Sans'] text-[15px] font-medium text-gray-600 hover:text-[#004492] transition-colors px-3 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="font-['Public_Sans'] text-[15px] font-medium text-[#004492] hover:text-[#004492] transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-white font-['Public_Sans'] text-[15px] font-semibold px-6 py-2 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-container"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="material-symbols-outlined" aria-hidden="true">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-[#DEE2E6] px-4 py-4 space-y-2"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <Link to="/topics" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Topics</Link>
          <Link to="/timeline" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Timeline</Link>
          <Link to="/chat" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Ask AI</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 text-[#004492] font-semibold" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="block py-2 text-gray-600 font-medium w-full text-left">Sign Out</button>
            </>
          ) : (
            <Link to="/signup" className="block py-2 text-[#004492] font-semibold" onClick={() => setMenuOpen(false)}>Sign In / Get Started</Link>
          )}
        </div>
      )}
    </header>
  );
}
