import { Request } from 'express';
import { Timestamp } from 'firebase-admin/firestore';

// ─── Firestore Document Types ────────────────────────────────────────────────

export interface UserDocument {
  displayName: string;
  email: string | null;
  locale: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'pa';
  progress: Record<string, { completed: boolean; completedAt: Timestamp | null }>;
  badgesEarned: string[];
  questionsAsked: number;
  topicsViewed: number;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

export type TopicCategory =
  | 'registration'
  | 'ballot'
  | 'polling'
  | 'eci-structure'
  | 'postal-voting'
  | 'election-security'
  | 'candidates'
  | 'campaign-finance'
  | 'certification'
  | 'civic-rights';

export interface TopicDocument {
  title: string;
  slug: string;
  category: TopicCategory;
  contentMd: string;
  mediaRefs: string[];
  locale: 'en' | 'hi';
  readingTimeMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TimelinePhase = 'registration' | 'nomination' | 'campaign' | 'polling' | 'counting' | 'certification';
export type TimelineEventType = 'deadline' | 'period' | 'election-day' | 'milestone';

export interface TimelineEvent {
  id: string;
  date: string; // ISO 8601 or range "YYYY-MM-DD/YYYY-MM-DD"
  phase: TimelinePhase;
  title: string;
  description: string;
  type: TimelineEventType;
  urgent?: boolean;
  actionUrl?: string;
}

export interface TimelineDocument {
  year: number;
  label: string;
  events: TimelineEvent[];
}

export interface MessageDocument {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  topicRefs: string[];
}

// ─── Content AST ─────────────────────────────────────────────────────────────

export type ContentNode =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'factsheet'; title: string; body: string; actionLabel: string; actionUrl: string };

// ─── Express Request Extensions ──────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  uid: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  topicRefs: string[];
}

export interface ProgressUpdateRequest {
  topicId: string;
  completed: boolean;
}
