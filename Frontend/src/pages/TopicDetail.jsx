import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import DashboardLayout from '../components/DashboardLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useTopic } from '../hooks/useTopics';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const CATEGORY_COLORS = {
  registration: 'bg-primary-fixed text-on-primary-fixed',
  ballot: 'bg-secondary-container text-on-secondary-container',
  polling: 'bg-tertiary-fixed text-on-tertiary-fixed',
  'eci-structure': 'bg-primary-fixed text-on-primary-fixed',
  'postal-voting': 'bg-secondary-container text-on-secondary-container',
  'election-security': 'bg-error-container text-on-error-container',
  candidates: 'bg-tertiary-fixed text-on-tertiary-fixed',
  'campaign-finance': 'bg-secondary-container text-on-secondary-container',
  certification: 'bg-primary-fixed text-on-primary-fixed',
  'civic-rights': 'bg-tertiary-fixed text-on-tertiary-fixed',
};

/**
 * Splits Markdown content into pages by H2 sections.
 * Each H2 heading starts a new page.
 * If no H2 found, returns the whole content as one page.
 */
function splitIntoPages(md) {
  if (!md) return [''];
  const lines = md.split('\n');
  const pages = [];
  let current = [];

  for (const line of lines) {
    if (line.match(/^## /) && current.length > 0) {
      pages.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) pages.push(current.join('\n'));
  return pages.filter(p => p.trim());
}

/** Persist progress to localStorage */
function getProgress() {
  try { return JSON.parse(localStorage.getItem('civic_progress') ?? '{}'); } catch { return {}; }
}
function saveProgress(topicId, data) {
  const all = getProgress();
  all[topicId] = { ...all[topicId], ...data };
  localStorage.setItem('civic_progress', JSON.stringify(all));
}

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error } = useTopic(topicId);
  const contentRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);

  // Completion
  const [completed, setCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Translation
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  // Load saved progress on mount
  useEffect(() => {
    if (!topicId) return;
    const prog = getProgress();
    if (prog[topicId]) {
      setCompleted(prog[topicId].completed ?? false);
      setCurrentPage(prog[topicId].lastPage ?? 0);
    }
  }, [topicId]);

  // Split content into pages when topic loads
  useEffect(() => {
    if (topic?.contentMd) {
      const p = splitIntoPages(topic.contentMd);
      setPages(p);
    }
  }, [topic]);

  // Re-split when translated content changes
  useEffect(() => {
    if (translatedContent) {
      setPages(splitIntoPages(translatedContent));
      setCurrentPage(0);
    } else if (topic?.contentMd) {
      setPages(splitIntoPages(topic.contentMd));
    }
  }, [translatedContent, topic]);

  const totalPages = pages.length;
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;

  const goToPage = (page) => {
    setCurrentPage(page);
    saveProgress(topicId, { lastPage: page });
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = () => {
    if (!isLastPage) goToPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (!isFirstPage) goToPage(currentPage - 1);
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    setJustCompleted(true);
    saveProgress(topicId, { completed: true, completedAt: new Date().toISOString(), lastPage: currentPage });
    setTimeout(() => setJustCompleted(false), 3000);
  };

  // Translation
  const handleTranslate = async (langCode) => {
    setSelectedLang(langCode);
    setTranslateError('');
    if (langCode === 'en') { setTranslatedContent(null); return; }
    setTranslating(true);
    try {
      // Get Firebase ID token — required by the translate endpoint
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // If user is not logged in, show a helpful message instead of auth error
      if (!currentUser) {
        setTranslateError('Please sign in to use the translation feature.');
        setSelectedLang('en');
        setTranslating(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const res = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: topic.contentMd, targetLang: langCode, isMarkdown: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setTranslatedContent(data.translated);
      } else {
        setTranslateError(data.error ?? 'Translation failed');
        setSelectedLang('en');
      }
    } catch {
      setTranslateError('Could not connect to translation service. Make sure the backend is running.');
      setSelectedLang('en');
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
          <p className="text-on-surface-variant">Loading topic...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !topic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="material-symbols-outlined text-outline text-[48px]">error_outline</span>
          <h2 className="font-['Public_Sans'] text-[20px] font-semibold text-on-surface">Topic not found</h2>
          <Link to="/topics" className="mt-2 inline-flex items-center gap-1 text-primary-container font-semibold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Topics
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const categoryColor = CATEGORY_COLORS[topic.category] ?? 'bg-surface-container text-on-surface-variant';
  const categoryLabel = topic.category?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const currentPageContent = pages[currentPage] ?? '';

  return (
    <DashboardLayout>
      <div className="max-w-3xl" ref={contentRef}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-5" aria-label="Breadcrumb">
          <Link to="/topics" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">library_books</span>Topics
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium truncate">{topic.title}</span>
        </nav>

        {/* Header card */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${categoryColor}`}>
              {categoryLabel}
            </span>
            <span className="text-[12px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {topic.readingTimeMinutes} min read
            </span>
            {completed && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Completed
              </span>
            )}
          </div>

          <h1 className="font-['Public_Sans'] text-[24px] font-bold text-primary leading-tight mb-4">
            {topic.title}
          </h1>

          {/* Page progress bar */}
          {totalPages > 1 && (
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-on-surface-variant mb-1.5">
                <span className="font-bold uppercase tracking-widest">Page {currentPage + 1} of {totalPages}</span>
                <span>{Math.round(((currentPage + 1) / totalPages) * 100)}% read</span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                />
              </div>
              {/* Page dots */}
              <div className="flex gap-1.5 mt-2 justify-center">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`rounded-full transition-all ${
                      i === currentPage
                        ? 'w-5 h-2 bg-primary-container'
                        : i < currentPage
                        ? 'w-2 h-2 bg-secondary'
                        : 'w-2 h-2 bg-surface-container-highest'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-outline-variant">
            <Link
              to="/chat"
              state={{ topicTitle: topic.title, topicId: topic.id }}
              className="inline-flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              Ask AI about this topic
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 border border-[#DEE2E6] text-on-surface-variant px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          </div>

          {/* Translate */}
          <div className="mt-4 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-primary-container">translate</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Translate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleTranslate(code)}
                  disabled={translating}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                    selectedLang === code
                      ? 'bg-primary-container text-white border-primary-container'
                      : 'bg-white border-[#DEE2E6] text-on-surface-variant hover:bg-surface-container'
                  } disabled:opacity-50`}
                >
                  {label}
                </button>
              ))}
            </div>
            {translating && (
              <p className="text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] animate-spin text-primary-container">progress_activity</span>
                Translating...
              </p>
            )}
            {translateError && (
              <p className="text-[12px] text-error mt-2">{translateError}</p>
            )}
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-6 md:p-8 relative">
          {translating && (
            <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-primary-container text-[36px] animate-spin">progress_activity</span>
            </div>
          )}
          <MarkdownRenderer content={currentPageContent} />
        </div>

        {/* ── Navigation + Complete bar ── */}
        <div className="mt-4 bg-white border border-[#DEE2E6] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Prev button */}
          <button
            onClick={handlePrev}
            disabled={isFirstPage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DEE2E6] text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Previous
          </button>

          {/* Center — page indicator + complete button */}
          <div className="flex flex-col items-center gap-2">
            {totalPages > 1 && (
              <span className="text-[12px] text-on-surface-variant font-medium">
                Page {currentPage + 1} / {totalPages}
              </span>
            )}

            {/* Mark as Complete — shown on last page or if already completed */}
            {(isLastPage || completed) && (
              <button
                onClick={completed ? undefined : handleMarkComplete}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  completed
                    ? 'bg-secondary text-white cursor-default'
                    : justCompleted
                    ? 'bg-secondary text-white scale-105'
                    : 'bg-secondary/10 text-secondary border-2 border-secondary hover:bg-secondary hover:text-white active:scale-95'
                }`}
                aria-label={completed ? 'Topic completed' : 'Mark as complete'}
              >
                <span className="material-symbols-outlined text-[18px]"
                  style={completed ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {completed ? 'Completed ✓' : 'Mark as Complete'}
              </button>
            )}
          </div>

          {/* Next button */}
          {!isLastPage ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-container text-white text-[13px] font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Next
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <Link
              to="/topics"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-[#DEE2E6] text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
            >
              All Topics
              <span className="material-symbols-outlined text-[18px]">library_books</span>
            </Link>
          )}
        </div>

        {/* Just completed toast */}
        {justCompleted && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-semibold text-[14px]">Topic marked as complete!</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
