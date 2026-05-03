import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useTopic } from '../hooks/useTopics';

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

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error } = useTopic(topicId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-primary text-[40px] animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-['Lexend']">Loading topic...</p>
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
          <p className="text-on-surface-variant text-sm max-w-sm">
            {error || 'This topic does not exist or has been removed.'}
          </p>
          <Link to="/topics" className="mt-2 inline-flex items-center gap-1 text-primary-container font-semibold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Topics
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const categoryColor = CATEGORY_COLORS[topic.category] ?? 'bg-surface-container text-on-surface-variant';
  const categoryLabel = topic.category?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <DashboardLayout>
      <div className="max-w-3xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-5" aria-label="Breadcrumb">
          <Link to="/topics" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">library_books</span>
            Topics
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium truncate">{topic.title}</span>
        </nav>

        {/* Topic header card */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${categoryColor}`}>
              {categoryLabel}
            </span>
            <span className="text-[12px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {topic.readingTimeMinutes} min read
            </span>
            <span className="text-[12px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">translate</span>
              {topic.locale === 'en' ? 'English' : 'हिन्दी'}
            </span>
          </div>

          <h1 className="font-['Public_Sans'] text-[26px] font-bold text-primary leading-tight mb-3">
            {topic.title}
          </h1>

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
        </div>

        {/* Topic content */}
        <div className="bg-white border border-[#DEE2E6] rounded-xl p-6 md:p-8">
          <MarkdownRenderer content={topic.contentMd} />
        </div>

        {/* Bottom navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant">
          <Link
            to="/topics"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            All Topics
          </Link>
          <Link
            to="/chat"
            state={{ topicTitle: topic.title, topicId: topic.id }}
            className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            Discuss with AI
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
