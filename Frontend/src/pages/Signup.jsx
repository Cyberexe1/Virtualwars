import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInAsGuest, error, loading, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await signIn(email, password);
    if (ok) navigate('/dashboard');
  };

  const handleGuest = async () => {
    const ok = await signInAsGuest();
    if (ok) navigate('/dashboard');
  };

  const handleGoogle = async () => {
    const ok = await signInWithGoogle();
    if (ok) navigate('/dashboard');
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col"
      style={{ backgroundImage: 'radial-gradient(#00449210 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      <NavBar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-surface-container-lowest border border-[#DEE2E6] shadow-sm overflow-hidden rounded-lg">

          {/* Left panel — benefits */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-surface-container-low border-r border-[#DEE2E6]">
            <div className="space-y-8">
              <div>
                <h2 className="font-['Public_Sans'] text-[28px] font-semibold text-primary-container leading-tight mb-2">
                  Sign In to Continue Learning
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Access personalized voting guides and track your civic journey across India's election process.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: 'analytics', title: 'Track Your Progress', desc: 'Save completed lessons and election dates to your personal dashboard.' },
                  { icon: 'verified', title: 'Verified Sources', desc: 'Get non-partisan, cross-checked information from ECI and official sources.' },
                  { icon: 'notifications_active', title: 'Smart Alerts', desc: 'Never miss a voter registration or nomination deadline.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface text-[15px]">{title}</h3>
                      <p className="text-sm text-on-surface-variant">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo credentials card */}
              <div className="bg-primary-fixed/40 border border-primary-fixed rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Demo Credentials</p>
                <div className="space-y-1 text-sm font-mono">
                  <p><span className="text-on-surface-variant">Email: </span><span className="font-semibold text-on-surface">{DEMO_CREDENTIALS.email}</span></p>
                  <p><span className="text-on-surface-variant">Password: </span><span className="font-semibold text-on-surface">{DEMO_CREDENTIALS.password}</span></p>
                </div>
                <button
                  onClick={fillDemo}
                  className="mt-3 text-xs font-bold text-primary-container hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  Auto-fill demo credentials
                </button>
              </div>
            </div>

            <div className="border-t border-[#DEE2E6] pt-4 flex items-center gap-3 text-secondary font-medium">
              <span className="material-symbols-outlined">shield_person</span>
              <span className="text-sm">Your data is encrypted and non-commercial.</span>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="p-8 bg-surface-container-lowest">
            <div className="mb-6">
              <h2 className="font-['Public_Sans'] text-2xl font-semibold text-primary-container">Sign In</h2>
              <p className="text-sm text-on-surface-variant mt-1">Continue your civic journey</p>
            </div>

            <div className="space-y-5">
              {/* Google OAuth button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-12 border border-[#DEE2E6] rounded-lg flex items-center justify-center gap-3 font-medium text-on-surface hover:bg-surface-container-low transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-[#DEE2E6]"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-widest">or use email</span>
                <div className="flex-grow border-t border-[#DEE2E6]"></div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg flex items-center gap-3" role="alert">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Mobile demo hint */}
              <div className="md:hidden bg-primary-fixed/40 border border-primary-fixed rounded-lg p-3">
                <p className="text-xs font-bold text-primary mb-1">Demo Credentials</p>
                <p className="text-xs font-mono text-on-surface">{DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}</p>
                <button onClick={fillDemo} className="mt-2 text-xs font-bold text-primary-container hover:underline">Auto-fill</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 px-4 bg-surface-container-low border border-[#DEE2E6] rounded-lg focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                      Password
                    </label>
                    <a href="#" className="text-sm text-primary-container hover:underline font-medium">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 pr-12 bg-surface-container-low border border-[#DEE2E6] rounded-lg focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary-container text-white rounded-lg font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-[#DEE2E6]"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-widest">Fast Track</span>
                <div className="flex-grow border-t border-[#DEE2E6]"></div>
              </div>

              <button
                onClick={handleGuest}
                className="w-full h-12 bg-surface-container-low text-primary-container border border-primary-container/20 rounded-lg font-medium hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Continue as Guest
                <span className="material-symbols-outlined text-[20px]">person_outline</span>
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Don't have an account?{' '}
                <a href="#" className="text-primary-container font-semibold hover:underline">Register Now</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
