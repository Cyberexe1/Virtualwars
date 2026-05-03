import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const CATEGORY_META = {
  registration:        { icon: 'how_to_reg',      badge: 'bg-primary-fixed text-on-primary-fixed' },
  ballot:              { icon: 'ballot',           badge: 'bg-secondary-container text-on-secondary-container' },
  polling:             { icon: 'location_on',      badge: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  'eci-structure':     { icon: 'account_balance',  badge: 'bg-primary-fixed text-on-primary-fixed' },
  'postal-voting':     { icon: 'mail',             badge: 'bg-secondary-container text-on-secondary-container' },
  'election-security': { icon: 'security',         badge: 'bg-error-container text-on-error-container' },
  candidates:          { icon: 'person_add',       badge: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  'campaign-finance':  { icon: 'payments',         badge: 'bg-secondary-container text-on-secondary-container' },
  certification:       { icon: 'flag',             badge: 'bg-primary-fixed text-on-primary-fixed' },
  'civic-rights':      { icon: 'gavel',            badge: 'bg-tertiary-fixed text-on-tertiary-fixed' },
};

function ProgressRing({ percent }) {
  const r = 58;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle className="text-surface-container" cx="64" cy="64" fill="transparent" r={r} stroke="currentColor" strokeWidth="8" />
        <circle
          className="text-secondary transition-all duration-700"
          cx="64" cy="64" fill="transparent" r={r}
          stroke="currentColor" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-['Public_Sans'] text-[24px] font-bold text-on-surface">{percent}%</span>
        <span className="text-[10px] uppercase font-bold text-outline">Complete</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.displayName || 'Guest';

  const [topics, setTopics] = useState([]);
  const [userStats, setUserStats] = useState({ topicsViewed: 0, questionsAsked: 0, badgesEarned: [], progress: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load all topics from Firestore
        const topicsSnap = await getDocs(collection(db, 'topics'));
        const topicsData = topicsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTopics(topicsData);

        // Load user stats if logged in (non-anonymous)
        if (user && !user.isAnonymous) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserStats({
              topicsViewed: data.topicsViewed ?? 0,
              questionsAsked: data.questionsAsked ?? 0,
              badgesEarned: data.badgesEarned ?? [],
              progress: data.progress ?? {},
            });
          }
        }
      } catch (err) {
        console.error('[Dashboard] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Calculate progress metrics from real data
  const totalTopics = topics.length || 10;
  const completedTopics = Object.values(userStats.progress).filter(p => p?.completed).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Topics not yet completed — show first 2 as "Continue Learning"
  const inProgressTopics = topics.filter(t => {
    const p = userStats.progress[t.id];
    return !p?.completed;
  }).slice(0, 2);

  // Recently completed topics for activity feed
  const recentlyCompleted = topics
    .filter(t => userStats.progress[t.id]?.completed)
    .slice(0, 3);

  // Badges logic
  const earnedBadges = [
    { icon: 'school', title: 'First Lesson', earned: completedTopics >= 1 },
    { icon: 'grade', title: 'Perfect Score', earned: completedTopics >= 3 },
    { icon: 'how_to_reg', title: 'Civic Duty', earned: completedTopics >= 5 },
    { icon: 'emoji_events', title: 'Expert Voter', earned: completedTopics >= 10 },
  ];

  return (
    <DashboardLayout>
      <section className="space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Public_Sans'] text-[40px] font-bold text-primary">Welcome back, {displayName}</h1>
            <p className="font-['Lexend'] text-[18px] text-on-surface-variant">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/chat" className="bg-white border border-[#DEE2E6] text-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-lg">help_outline</span>
              Ask a Question
            </Link>
            <Link to="/timeline" className="bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              View Timeline
            </Link>
          </div>
        </header>

        {/* Guest banner */}
        {user?.isAnonymous && (
          <div className="bg-primary-fixed/40 border border-primary-fixed rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-sm text-on-surface">You're browsing as a guest. Sign in to save your progress.</p>
            </div>
            <Link to="/signup" className="text-sm font-bold text-primary-container hover:underline whitespace-nowrap">Sign In</Link>
          </div>
        )}

        {/* Progress + stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white border border-[#DEE2E6] p-6 rounded-lg">
            <h2 className="font-['Public_Sans'] text-[24px] font-semibold text-primary mb-6">Learning Progress</h2>
            {loading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-32 h-32 rounded-full bg-surface-container flex-shrink-0" />
                <div className="flex-grow space-y-3">
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                  <div className="h-3 bg-surface-container rounded w-full" />
                  <div className="h-3 bg-surface-container rounded w-3/4" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProgressRing percent={progressPercent} />
                <div className="flex-grow space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Topics Completed</span>
                    <span className="font-bold text-lg text-secondary">{completedTopics} / {totalTopics}</span>
                  </div>
                  {/* Progress bar per topic */}
                  <div className="space-y-2">
                    {topics.slice(0, 4).map(t => {
                      const done = userStats.progress[t.id]?.completed;
                      return (
                        <div key={t.id} className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[16px] ${done ? 'text-secondary' : 'text-outline'}`}
                            style={done ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {done ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span className="text-[13px] text-on-surface-variant truncate flex-grow">{t.title}</span>
                        </div>
                      );
                    })}
                    {totalTopics > 4 && (
                      <Link to="/topics" className="text-[12px] text-primary-container font-semibold hover:underline">
                        +{totalTopics - 4} more topics →
                      </Link>
                    )}
                  </div>
                  {progressPercent === 0 && (
                    <p className="text-sm text-on-surface-variant">Start reading topics to track your progress here.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats cards */}
          <div className="md:col-span-4 grid grid-rows-2 gap-4">
            <div className="bg-primary-container text-white p-6 rounded-lg flex flex-col justify-between">
              <span className="font-['Public_Sans'] text-[11px] font-bold uppercase tracking-widest text-on-primary-container">Topics Viewed</span>
              <div className="flex items-end justify-between">
                <span className="font-['Public_Sans'] text-[40px] font-bold">
                  {loading ? '—' : userStats.topicsViewed || completedTopics}
                </span>
                <span className="material-symbols-outlined text-4xl opacity-50">menu_book</span>
              </div>
            </div>
            <div className="bg-secondary text-white p-6 rounded-lg flex flex-col justify-between">
              <span className="font-['Public_Sans'] text-[11px] font-bold uppercase tracking-widest text-secondary-container">Questions Asked</span>
              <div className="flex items-end justify-between">
                <span className="font-['Public_Sans'] text-[40px] font-bold">
                  {loading ? '—' : String(userStats.questionsAsked).padStart(2, '0')}
                </span>
                <span className="material-symbols-outlined text-4xl opacity-50">chat_bubble_outline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning + Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Continue Learning — real topics from Firestore */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Public_Sans'] text-[24px] font-semibold text-primary">Continue Learning</h3>
              <Link to="/topics" className="text-[13px] font-semibold text-primary-container hover:underline flex items-center gap-1">
                View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white border border-[#DEE2E6] rounded-lg p-5 animate-pulse flex gap-4">
                    <div className="w-24 h-24 bg-surface-container rounded-lg flex-shrink-0" />
                    <div className="flex-grow space-y-2">
                      <div className="h-3 bg-surface-container rounded w-1/3" />
                      <div className="h-4 bg-surface-container rounded w-3/4" />
                      <div className="h-3 bg-surface-container rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : inProgressTopics.length === 0 ? (
              <div className="bg-white border border-[#DEE2E6] rounded-lg p-8 text-center">
                <span className="material-symbols-outlined text-secondary text-[40px] mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <p className="font-semibold text-on-surface">All topics completed!</p>
                <p className="text-sm text-on-surface-variant mt-1">You've mastered all election topics.</p>
                <Link to="/topics" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary-container hover:underline">
                  Review topics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            ) : (
              inProgressTopics.map((topic, idx) => {
                const meta = CATEGORY_META[topic.category] ?? { icon: 'article', badge: 'bg-surface-container text-on-surface-variant' };
                const categoryLabel = (topic.category ?? '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.id}`}
                    className="bg-white border border-[#DEE2E6] rounded-lg overflow-hidden flex group hover:shadow-md transition-shadow"
                  >
                    {/* Icon panel */}
                    <div className="w-24 flex-shrink-0 bg-surface-container-low flex items-center justify-center">
                      <span className={`material-symbols-outlined text-[36px] ${idx === 0 ? 'text-primary-container' : 'text-secondary'}`}>
                        {meta.icon}
                      </span>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${meta.badge}`}>
                            {categoryLabel}
                          </span>
                          <span className="text-xs text-outline">{topic.readingTimeMinutes} min read</span>
                        </div>
                        <h4 className="font-bold text-[15px] text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {topic.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-[13px] font-semibold text-primary-container">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        {idx === 0 ? 'Resume Reading' : 'Start Topic'}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-['Public_Sans'] text-[24px] font-semibold text-primary">Recent Activity</h3>
            <div className="bg-white border border-[#DEE2E6] rounded-lg p-6 space-y-5">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex-shrink-0" />
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-surface-container rounded w-3/4" />
                        <div className="h-2 bg-surface-container rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentlyCompleted.length > 0 ? (
                recentlyCompleted.map(t => (
                  <div key={t.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-secondary-container"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Completed: {t.title}</p>
                      <p className="text-xs text-outline mt-0.5">
                        {userStats.progress[t.id]?.completedAt?.toDate?.()?.toLocaleDateString('en-IN') ?? 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-outline text-[32px] mb-2 block">history</span>
                  <p className="text-sm text-on-surface-variant">No activity yet.</p>
                  <Link to="/topics" className="mt-2 text-sm font-bold text-primary-container hover:underline block">
                    Start your first topic →
                  </Link>
                </div>
              )}

              {/* Always show: questions asked */}
              {!loading && userStats.questionsAsked > 0 && (
                <div className="flex gap-4 border-t border-[#DEE2E6] pt-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-primary-fixed-variant">chat</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Asked {userStats.questionsAsked} question{userStats.questionsAsked !== 1 ? 's' : ''} to AI</p>
                    <Link to="/chat" className="text-xs text-primary-container font-semibold hover:underline">Continue chatting →</Link>
                  </div>
                </div>
              )}

              <Link to="/topics" className="block w-full py-2 border-t border-[#DEE2E6] text-sm text-primary font-semibold hover:text-blue-700 transition-colors text-center">
                View All Topics
              </Link>
            </div>

            {/* Badges */}
            <div className="bg-white border border-[#DEE2E6] p-6 rounded-lg">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                Badges Earned
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {earnedBadges.map(({ icon, title, earned }) => (
                  <div key={title} title={title}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                      earned ? 'bg-secondary/10 border-secondary/20' : 'bg-surface-container-highest border-dashed border-outline opacity-50'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${earned ? 'text-secondary' : 'text-outline'}`}
                      style={earned ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {icon}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3">
                {completedTopics === 0
                  ? 'Complete topics to earn badges'
                  : `${earnedBadges.filter(b => b.earned).length} of ${earnedBadges.length} badges earned`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
