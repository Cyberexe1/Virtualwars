import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'event', label: 'Election Dates', to: '/timeline' },
  { icon: 'chat', label: 'Ask AI', to: '/chat' },
];

const DID_YOU_KNOW_FACTS = [
  'India uses Electronic Voting Machines (EVMs) since 1982. The VVPAT system was introduced in 2013 for voter-verified paper audit trails.',
  'India has the world\'s largest electorate — over 960 million registered voters as of 2024.',
  'The Election Commission of India was established on January 25, 1950 — one day before India became a Republic.',
  'India\'s 2024 Lok Sabha elections were conducted in 7 phases across 44 days, the longest in history.',
];

// Compute once at module level — stable across renders, changes daily
const DAILY_FACT = DID_YOU_KNOW_FACTS[Math.floor(Date.now() / 86400000) % DID_YOU_KNOW_FACTS.length];

export default function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.displayName || 'Guest';
  const fact = DAILY_FACT;

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="md:sticky md:top-24 space-y-6">
        {/* User card + nav */}
        <div className="bg-white border border-[#DEE2E6] rounded-lg overflow-hidden">
          {/* User profile — hidden on mobile to save space */}
          <div className="hidden md:flex items-center gap-3 px-4 pt-5 pb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[15px] text-on-surface leading-tight">{displayName}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {user?.isAnonymous ? 'Guest User' : 'Verified Voter'}
              </p>
            </div>
          </div>

          {/* Divider — only on desktop */}
          <div className="hidden md:block border-t border-[#DEE2E6]"></div>

          {/* Nav links — horizontal scroll on mobile, vertical on desktop */}
          <nav className="py-1 md:py-2 overflow-x-auto">
            <div className="flex flex-row md:flex-col min-w-max md:min-w-0">
              {NAV_ITEMS.map(({ icon, label, to }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={label}
                    to={to}
                    className={`flex items-center gap-2 md:gap-3 px-4 py-3 transition-colors relative flex-shrink-0 ${
                      active
                        ? 'bg-surface-container-low text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'
                    }`}
                  >
                    {/* Active left border — desktop only */}
                    {active && (
                      <span className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm"></span>
                    )}
                    {/* Active bottom border — mobile only */}
                    {active && (
                      <span className="md:hidden absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-sm"></span>
                    )}
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {icon}
                    </span>
                    <span className="text-[14px] md:text-[15px] whitespace-nowrap">{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Did You Know card — hidden on mobile */}
        <div className="hidden md:block bg-[#EEF2FF] border-l-4 border-primary rounded-r-lg p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
            Did You Know?
          </p>
          <p className="text-sm leading-relaxed text-on-surface-variant">{fact}</p>
        </div>
      </div>
    </aside>
  );
}
