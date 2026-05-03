import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useTopics } from '../hooks/useTopics';

const CATEGORY_META = {
  registration:       { color: 'bg-primary-fixed text-on-primary-fixed',         icon: 'how_to_reg',       iconColor: 'text-primary-container' },
  ballot:             { color: 'bg-secondary-container text-on-secondary-container', icon: 'ballot',        iconColor: 'text-secondary' },
  polling:            { color: 'bg-tertiary-fixed text-on-tertiary-fixed',        icon: 'location_on',      iconColor: 'text-tertiary' },
  'eci-structure':    { color: 'bg-primary-fixed text-on-primary-fixed',          icon: 'account_balance',  iconColor: 'text-primary-container' },
  'postal-voting':    { color: 'bg-secondary-container text-on-secondary-container', icon: 'mail',          iconColor: 'text-secondary' },
  'election-security':{ color: 'bg-error-container text-on-error-container',      icon: 'security',         iconColor: 'text-error' },
  candidates:         { color: 'bg-tertiary-fixed text-on-tertiary-fixed',        icon: 'person_add',       iconColor: 'text-tertiary' },
  'campaign-finance': { color: 'bg-secondary-container text-on-secondary-container', icon: 'payments',      iconColor: 'text-secondary' },
  certification:      { color: 'bg-primary-fixed text-on-primary-fixed',          icon: 'flag',             iconColor: 'text-primary-container' },
  'civic-rights':     { color: 'bg-tertiary-fixed text-on-tertiary-fixed',        icon: 'gavel',            iconColor: 'text-tertiary' },
};

const STATUS_FILTERS = ['All', 'Completed', 'In Progress', 'Not Started'];

// Read progress from localStorage (set by TopicDetail when user reads/completes)
function getLocalProgress() {
  try { return JSON.parse(localStorage.getItem('civic_progress') ?? '{}'); } catch { return {}; }
}

function getStatus(topicId) {
  const prog = getLocalProgress();
  const p = prog[topicId];
  if (!p) return 'not-started';
  if (p.completed) return 'completed';
  if (p.lastPage !== undefined && p.lastPage > 0) return 'in-progress';
  return 'not-started';
}

const statusLabel = {
  completed:    { label: 'Completed',   icon: 'check_circle',          color: 'text-secondary',        bg: 'bg-secondary-container' },
  'in-progress':{ label: 'In Progress', icon: 'pending',               color: 'text-primary-container', bg: 'bg-primary-fixed' },
  'not-started':{ label: 'Not Started', icon: 'radio_button_unchecked', color: 'text-outline',          bg: 'bg-surface-container' },
};

export default function Topics() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [, forceUpdate] = useState(0);
  const { topics: firestoreTopics, loading } = useTopics();

  // Re-read localStorage when page becomes visible (user returns from TopicDetail)
  useEffect(() => {
    const onFocus = () => forceUpdate(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Enrich Firestore topics with progress + meta
  const ALL_TOPICS = firestoreTopics.map((t) => {
    const localProg = getLocalProgress();
    const p = localProg[t.id];
    const progress = p?.completed ? 100 : p?.lastPage ? Math.round((p.lastPage / 5) * 80) : 0;
    const status = getStatus(t.id);
    const meta = CATEGORY_META[t.category] ?? { color: 'bg-surface-container text-on-surface-variant', icon: 'article', iconColor: 'text-outline' };
    return {
      ...t,
      progress,
      status,
      categoryLabel: (t.category ?? '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      ...meta,
    };
  });

  const filtered = ALL_TOPICS.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Completed' && t.status === 'completed') ||
      (activeFilter === 'In Progress' && t.status === 'in-progress') ||
      (activeFilter === 'Not Started' && t.status === 'not-started');

    return matchesSearch && matchesFilter;
  });

  const completedCount = ALL_TOPICS.filter((t) => t.status === 'completed').length;
  const inProgressCount = ALL_TOPICS.filter((t) => t.status === 'in-progress').length;
  const total = ALL_TOPICS.length || 10;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Public_Sans'] text-[32px] font-bold text-primary">Election Topics</h1>
            <p className="text-on-surface-variant font-['Lexend'] text-[15px] mt-1">
              {loading ? 'Loading...' : `${completedCount} of ${total} topics completed`}
            </p>
          </div>
          <div className="md:w-64">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
              <span>Overall Progress</span>
              <span>{total > 0 ? Math.round((completedCount / total) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Completed', value: completedCount, icon: 'check_circle', color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20' },
            { label: 'In Progress', value: inProgressCount, icon: 'pending', color: 'text-primary-container', bg: 'bg-primary-fixed/40 border-primary-fixed' },
            { label: 'Not Started', value: total - completedCount - inProgressCount, icon: 'radio_button_unchecked', color: 'text-outline', bg: 'bg-surface-container border-outline-variant' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-lg border ${bg}`}>
              <span className={`material-symbols-outlined text-[24px] ${color}`}
                style={label === 'Completed' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {icon}
              </span>
              <div>
                <p className="font-['Public_Sans'] text-[22px] font-bold text-on-surface">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#DEE2E6] rounded-lg text-[14px] text-on-surface placeholder-outline focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all"
              aria-label="Search topics"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" aria-label="Clear search">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  activeFilter === f ? 'bg-primary-container text-white shadow-sm' : 'bg-white border border-[#DEE2E6] text-on-surface-variant hover:bg-surface-container'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {search && (
          <p className="text-[13px] text-on-surface-variant">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="font-semibold text-on-surface">{search}</span>"
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#DEE2E6] rounded-xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-surface-container rounded-lg" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 bg-surface-container rounded w-1/3" />
                    <div className="h-3 bg-surface-container rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-surface-container rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-container rounded w-full mb-1" />
                <div className="h-3 bg-surface-container rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Topic cards */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-3">search_off</span>
            <p className="font-semibold text-on-surface">No topics found</p>
            <p className="text-sm text-on-surface-variant mt-1">Try a different search term or filter</p>
            <button onClick={() => { setSearch(''); setActiveFilter('All'); }}
              className="mt-4 text-sm font-bold text-primary-container hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((topic) => {
              const s = statusLabel[topic.status];
              return (
                <div key={topic.id} className="bg-white border border-[#DEE2E6] rounded-xl p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center flex-shrink-0">
                        <span className={`material-symbols-outlined text-[22px] ${topic.iconColor}`}>{topic.icon}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${topic.color}`}>
                          {topic.categoryLabel}
                        </span>
                        <p className="text-[11px] text-outline mt-0.5">{topic.readingTimeMinutes} min read</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${s.bg} flex-shrink-0`}>
                      <span className={`material-symbols-outlined text-[14px] ${s.color}`}
                        style={topic.status === 'completed' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {s.icon}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${s.color}`}>{s.label}</span>
                    </div>
                  </div>

                  <h3 className="font-['Public_Sans'] text-[15px] font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>

                  {topic.progress > 0 && (
                    <div className="mb-3 mt-2">
                      <div className="flex justify-between text-[11px] text-on-surface-variant mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{topic.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${topic.status === 'completed' ? 'bg-secondary' : 'bg-primary-container'}`}
                          style={{ width: `${topic.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Read / Resume / Review button */}
                  <Link
                    to={`/topics/${topic.id}`}
                    className={`inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors mt-2 ${
                      topic.status === 'completed' ? 'text-secondary hover:text-green-700' : 'text-primary-container hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {topic.status === 'completed' ? 'replay' : topic.status === 'in-progress' ? 'play_arrow' : 'menu_book'}
                    </span>
                    {topic.status === 'completed' ? 'Review' : topic.status === 'in-progress' ? 'Resume Reading' : 'Read Topic'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
