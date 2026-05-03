import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function AlertModal({ onClose }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to the server. Make sure the backend is running.');
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-primary px-6 py-5 flex items-start justify-between">
          <div>
            <h2 id="alert-modal-title" className="font-['Public_Sans'] text-[20px] font-bold text-white">
              Get Election Alerts
            </h2>
            <p className="text-on-primary-container text-[13px] mt-1">
              Receive email reminders for key election deadlines
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors ml-4 mt-0.5"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-secondary text-[36px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <h3 className="font-['Public_Sans'] text-[18px] font-semibold text-on-surface mb-2">
                Alerts Activated!
              </h3>
              <p className="text-[14px] text-on-surface-variant leading-relaxed mb-6">
                {message}
              </p>
              <button
                onClick={onClose}
                className="w-full h-11 bg-primary-container text-white rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* What you'll receive */}
              <div className="bg-surface-container-low rounded-lg p-4 mb-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                  You'll be alerted for:
                </p>
                {[
                  { dot: 'bg-primary', text: 'Voter roll revision deadlines' },
                  { dot: 'bg-error', text: 'Registration cutoff dates' },
                  { dot: 'bg-secondary', text: 'Polling day reminders' },
                  { dot: 'bg-primary', text: 'Counting & results day' },
                ].map(({ dot, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="text-[13px] text-on-surface-variant">{text}</span>
                  </div>
                ))}
              </div>

              {/* Error banner */}
              {status === 'error' && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg flex items-center gap-2 mb-4" role="alert">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span className="text-[13px] font-medium">{message}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="alert-email">
                    Your Email Address
                  </label>
                  <input
                    id="alert-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 px-4 bg-surface-container-low border border-[#DEE2E6] rounded-lg text-[14px] focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full h-11 bg-primary-container text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                      Activate Alerts
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-outline text-center mt-3">
                We'll send one confirmation email. No spam, ever.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
