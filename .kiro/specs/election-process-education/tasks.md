# Implementation Plan: Election Process Education Assistant

## Overview

Implement the full-stack Civic Clarity application by building the Node.js/Express backend in a new `Backend/` folder, wiring it to Firebase and Vertex AI, then integrating the existing React frontend with real Firebase services. Tasks proceed from infrastructure setup through API implementation, frontend integration, accessibility hardening, testing, and CI/CD.

## Tasks

- [ ] 1. Set up Backend project structure and core configuration
  - Create `Backend/` directory with `src/`, `src/routes/`, `src/middleware/`, `src/services/`, `src/scripts/`, and `src/types/` sub-folders
  - Initialise `package.json` with `express`, `firebase-admin`, `@google-cloud/vertexai`, `cors`, `helmet`, `dotenv`, `zod` dependencies (pinned versions)
  - Configure TypeScript (`tsconfig.json`) targeting Node 18, `strict: true`, `outDir: dist`
  - Create `src/index.ts` entry point: initialise Express app, apply `helmet`, `cors`, and `express.json()` middleware, mount route modules, start server on `PORT` env var
  - Create `.env.example` listing all required environment variables (`FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `VERTEX_AI_LOCATION`, `PORT`)
  - Add `eslint` + `prettier` config files matching the Frontend style
  - _Requirements: 6.1, 6.2, 11.5_

- [ ] 2. Implement Firebase Admin SDK initialisation and ID token verification middleware
  - [x] 2.1 Create `src/services/firebaseAdmin.ts` that initialises the Firebase Admin SDK using `applicationDefault()` credentials and exports `adminAuth` and `adminDb` singletons
    - _Requirements: 6.1, 7.1, 7.2_
  - [x] 2.2 Create `src/middleware/verifyToken.ts` Express middleware that reads the `Authorization: Bearer <token>` header, calls `adminAuth.verifyIdToken()`, attaches `req.uid` on success, and returns `401` with a JSON error body on failure
    - _Requirements: 7.2, 7.5, 1.2_
  - [ ]* 2.3 Write unit tests for `verifyToken` middleware
    - Test valid token → `req.uid` set and `next()` called
    - Test missing header → 401 returned
    - Test invalid/expired token → 401 returned
    - _Requirements: 7.5, 11.1_

- [ ] 3. Implement input sanitisation middleware
  - [ ] 3.1 Create `src/middleware/sanitize.ts` that implements `sanitizeInput(raw: string): string` — strips HTML tags, removes characters outside `[\w\s.,?!'-]`, trims, and truncates to 500 characters; export as Express middleware that sanitises `req.body.message` in place
    - _Requirements: 7.3, 2.1_
  - [ ]* 3.2 Write unit tests for `sanitizeInput`
    - Test HTML tag stripping (`<script>alert(1)</script>` → empty)
    - Test special character removal
    - Test 500-character truncation
    - Test whitespace trimming
    - _Requirements: 7.3, 11.1_
  - [ ]* 3.3 Write property test for `sanitizeInput` idempotency
    - **Property 1 (derived): Sanitise idempotency — `sanitizeInput(sanitizeInput(s)) === sanitizeInput(s)` for all string inputs**
    - **Validates: Requirements 7.3**
    - Tag: `// Feature: election-process-education, Property 1: sanitize idempotency`
    - _Requirements: 7.3, 11.1_

- [ ] 4. Implement `ContentService` — Markdown parsing, serialisation, and schema validation
  - [ ] 4.1 Create `src/services/contentService.ts` with `parseMarkdown(md: string): ContentNode[]` and `serializeNodes(nodes: ContentNode[]): string` functions matching the `ContentNode` union type from the design; export `validateTopicSchema(doc: unknown): TopicDocument` using Zod
    - _Requirements: 5.1, 11.4, 11.6_
  - [ ]* 4.2 Write unit tests for `ContentService`
    - Test each `ContentNode` type parses correctly
    - Test `validateTopicSchema` rejects invalid documents with descriptive errors
    - Test serialisation produces valid Markdown
    - _Requirements: 11.1, 11.4, 11.6_
  - [ ]* 4.3 Write property test for content round-trip consistency
    - **Property 2: Round-trip consistency — `parseMarkdown(serializeNodes(parseMarkdown(md)))` produces an AST equivalent to `parseMarkdown(md)` for any valid Markdown string**
    - **Validates: Requirements 11.4**
    - Tag: `// Feature: election-process-education, Property 2: content round-trip`
    - _Requirements: 11.4_

- [ ] 5. Seed Firestore with India ECI election topics and timeline data
  - [ ] 5.1 Create `src/scripts/seedTopics.ts` that writes at least 10 `TopicDocument` records to the `topics/` Firestore collection covering: voter registration, ballot types, polling locations, electoral college equivalent (ECI structure), absentee/postal voting, election security, candidate selection, campaign finance, results certification, and civic rights — all scoped to India ECI process; validate each document with `validateTopicSchema` before writing
    - _Requirements: 5.1, 5.5, 11.6_
  - [ ] 5.2 Create `src/scripts/seedTimeline.ts` that writes one `TimelineDocument` to `timelines/india-2024` with `TimelineEvent[]` covering the full ECI election cycle phases: voter registration window, nomination filing, campaign period, polling day(s), counting day, and results certification; include at least one `urgent` event
    - _Requirements: 3.1, 3.3, 3.4_
  - [ ] 5.3 Add `npm run seed` script in `Backend/package.json` that runs both seed scripts sequentially
    - _Requirements: 5.1, 3.3_

- [ ] 6. Write and deploy Firestore security rules
  - Create `firestore.rules` at the repo root implementing the rules from the design: `users/{uid}` read/write requires `request.auth.uid == uid`; `topics/{topicId}` public read, no client write; `timelines/{cycleId}` public read, no client write; `conversations/{uid}/messages/{msgId}` read/write requires `request.auth.uid == uid`
  - Add `firestore.rules` reference to `firebase.json`
  - _Requirements: 7.2, 4.5, 6.2_

- [ ] 7. Implement Topics API endpoint (`GET /api/topics`)
  - [ ] 7.1 Create `src/routes/topics.ts` with `GET /api/topics` handler that queries Firestore `topics/` collection, optionally filtering by `?category=` and `?locale=` query params, and returns a JSON array of `TopicDocument`; no auth required (public read)
    - _Requirements: 5.1, 5.2, 5.5_
  - [ ] 7.2 Create `GET /api/topics/:topicId` handler in the same router that fetches a single topic by ID and returns 404 with a JSON error if not found
    - _Requirements: 5.4_
  - [ ]* 7.3 Write unit tests for the topics route handlers
    - Test successful list response shape
    - Test category and locale filtering
    - Test 404 for unknown topicId
    - _Requirements: 11.1, 11.3_

- [ ] 8. Implement Timeline API endpoint (`GET /api/timeline`)
  - [ ] 8.1 Create `src/routes/timeline.ts` with `GET /api/timeline/:cycleId` handler that fetches the `TimelineDocument` from Firestore and returns it as JSON; return 404 if not found; no auth required
    - _Requirements: 3.1, 3.3_
  - [ ]* 8.2 Write unit tests for the timeline route handler
    - Test successful response includes `events[]` array
    - Test 404 for unknown cycleId
    - _Requirements: 11.1, 11.3_

- [ ] 9. Implement Progress API endpoints (`GET /api/progress` and `POST /api/progress`)
  - [ ] 9.1 Create `src/routes/progress.ts` with `GET /api/progress` handler (requires `verifyToken`) that reads `users/{uid}.progress` from Firestore and returns it as JSON
    - _Requirements: 4.1, 4.2, 4.5_
  - [ ] 9.2 Add `POST /api/progress` handler (requires `verifyToken`) that accepts `{ topicId: string, completed: boolean }`, validates with Zod, and performs a Firestore batch write updating `users/{uid}.progress[topicId]` and incrementing `topicsViewed`; return the updated progress object
    - _Requirements: 4.1, 4.3, 4.5_
  - [ ]* 9.3 Write unit tests for progress route handlers
    - Test GET returns correct progress shape for authenticated user
    - Test POST updates Firestore and returns updated progress
    - Test POST with invalid body returns 400 with descriptive error
    - Test unauthenticated requests return 401
    - _Requirements: 11.1, 4.1_

- [ ] 10. Implement Chat API endpoint (`POST /api/chat`) with Vertex AI Gemini
  - [ ] 10.1 Create `src/services/vertexService.ts` that initialises the Vertex AI client, defines the non-partisan ECI election education system prompt, and exports `generateResponse(history: MessageDocument[], userMessage: string): Promise<{ text: string; topicRefs: string[] }>` using `gemini-1.5-flash`; enforce 10-second timeout; catch Gemini errors and throw a typed `VertexError`
    - _Requirements: 2.1, 2.2, 2.4, 6.6_
  - [ ] 10.2 Create `src/routes/chat.ts` with `POST /api/chat` handler (requires `verifyToken` + `sanitize` middleware) that: reads last 20 messages from `conversations/{uid}/messages` ordered by timestamp; calls `vertexService.generateResponse`; batch-writes user and assistant `MessageDocument` records to Firestore; returns `{ response: string, topicRefs: string[] }`; on `VertexError` returns 502 with fallback message
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 6.6_
  - [ ]* 10.3 Write unit tests for the chat route handler
    - Test successful response writes two Firestore messages and returns response text
    - Test Gemini error returns 502 with fallback message body
    - Test unauthenticated request returns 401
    - Test message exceeding 500 chars is truncated before forwarding
    - _Requirements: 11.1, 2.6_

- [ ] 11. Checkpoint — Backend complete
  - Ensure all backend unit tests pass (`npm test` in `Backend/`)
  - Verify `npm run seed` populates Firestore without errors using the Firebase Emulator
  - Ask the user if any backend behaviour needs adjustment before proceeding to frontend integration

- [ ] 12. Integrate Firebase SDK into the React frontend
  - [ ] 12.1 Create `Frontend/src/firebase.ts` that initialises the Firebase app with config from `import.meta.env` variables and exports `auth`, `db`, `storage`, and `analytics` singletons using `getAuth`, `getFirestore`, `getStorage`, `getAnalytics`
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  - [ ] 12.2 Update `Frontend/src/context/AuthContext.jsx` to replace mock auth with real Firebase Auth: use `onAuthStateChanged` to track user state; implement `signInWithGoogle` (`signInWithPopup`), `signInWithEmail` (`signInWithEmailAndPassword`), `signInAnonymously`, and `signOut`; handle `linkWithCredential` for anonymous → permanent account merge
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 12.3 Update `Frontend/src/pages/Signup.jsx` to call the real auth methods from `AuthContext`, display Firebase error codes as user-friendly messages in the error banner, and show a spinner on the sign-in button during the auth request
    - _Requirements: 1.1, 1.4_

- [ ] 13. Integrate Firestore data into Timeline and Topics pages
  - [ ] 13.1 Create `Frontend/src/hooks/useTimeline.js` that subscribes to `timelines/india-2024` via `onSnapshot`, returns `{ events, loading, error }`, and recalculates the TODAY marker position on mount
    - _Requirements: 3.1, 3.4, 3.5_
  - [ ] 13.2 Update `Frontend/src/pages/Timeline.jsx` to consume `useTimeline` instead of static mock data; render `AlertBanner` for any event with `urgent: true`; implement keyboard-navigable horizontal scroll on the `TimelineVisualizer` container
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 13.3 Create `Frontend/src/hooks/useTopics.js` that fetches topics from `GET /api/topics` (with optional locale param from browser), returns `{ topics, loading, error }`, and exposes a `search(query)` function that filters client-side
    - _Requirements: 5.1, 5.2, 5.5_
  - [ ] 13.4 Update `Frontend/src/pages/Dashboard.jsx` to consume `useTopics` for the "Continue Learning" module cards and `useProgress` (see 13.5) for the `ProgressRing` and stats cards; replace all hardcoded mock data
    - _Requirements: 4.2, 5.1_

- [ ] 14. Implement progress tracking with Firestore
  - [ ] 14.1 Create `Frontend/src/hooks/useProgress.js` that calls `GET /api/progress` (with Firebase ID token in `Authorization` header) on mount, exposes `progress` state, and provides `markComplete(topicId)` which calls `POST /api/progress` and updates local state optimistically; handle offline by queuing writes and flushing on reconnect using Firestore offline persistence
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ] 14.2 Wire `useProgress` into `Dashboard.jsx` `ProgressRing` (percent = completed / total topics × 100), streak grid, and stats cards; mark category complete when all topics in that category are done
    - _Requirements: 4.2, 4.3_

- [ ] 15. Implement Chat page with real backend and Analytics
  - [ ] 15.1 Create `Frontend/src/hooks/useConversation.js` that maintains `messages` state, appends user messages optimistically, calls `POST /api/chat` with the Firebase ID token, appends the assistant response, and shows `TypingIndicator` within 300ms of submission; on error displays the fallback message
    - _Requirements: 2.1, 2.2, 2.6, 9.3_
  - [ ] 15.2 Update `Frontend/src/pages/Chat.jsx` to consume `useConversation`; enforce 500-character client-side limit with the character counter; disable send button on empty/whitespace input; render `FactSheetCard` for `topicRefs` returned by the API
    - _Requirements: 2.1, 2.5, 8.5_
  - [ ] 15.3 Integrate Google Analytics events: log `session_start` in `AuthContext` on sign-in state change; log `topic_complete` in `useProgress.markComplete`; log `question_asked` with SHA-256 hashed category in `useConversation`; log `service_error` in error handlers
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 16. Checkpoint — Frontend integration complete
  - Ensure the app builds without TypeScript/ESLint errors (`npm run build` in `Frontend/`)
  - Verify auth, chat, timeline, and progress flows work end-to-end against the Firebase Emulator
  - Ask the user if any integration behaviour needs adjustment before proceeding to accessibility and testing

- [ ] 17. Accessibility audit and fixes
  - [ ] 17.1 Audit all interactive elements in `NavBar.jsx`, `Chat.jsx`, `Timeline.jsx`, `Dashboard.jsx`, and `Signup.jsx` for missing or incorrect ARIA attributes; add `aria-label` to all icon-only buttons, `role="log" aria-live="polite"` to `ChatHistory`, `role="alert"` to `AlertBanner`, and `aria-label` to `ProgressRing` SVG
    - _Requirements: 8.1, 8.5_
  - [ ] 17.2 Add visible `focus-visible` ring (`outline: 2px solid #004492; outline-offset: 2px`) to all interactive elements via Tailwind `focus-visible:` utilities; verify Tab order follows visual reading order in all pages
    - _Requirements: 8.3_
  - [ ] 17.3 Audit all `<img>` tags and Storage-served media for descriptive `alt` text; add `aria-label` to PDF/infographic links; ensure no information is conveyed by colour alone (add shape/text indicators to timeline nodes and state indicators)
    - _Requirements: 8.4, 8.6_

- [ ] 18. Write backend integration tests using Firebase Emulator Suite
  - [ ] 18.1 Set up Vitest integration test suite in `Backend/` with `@firebase/rules-unit-testing` and Firebase Emulator; create `tests/integration/` directory with a shared emulator setup/teardown helper
    - _Requirements: 11.3_
  - [ ]* 18.2 Write integration test for Firebase Auth token verification
    - Test valid Firebase ID token is accepted by `verifyToken` middleware
    - Test revoked/expired token returns 401
    - _Requirements: 11.3, 1.2_
  - [ ]* 18.3 Write integration test for Firestore security rules
    - Test authenticated user can read/write their own `users/{uid}` document
    - Test authenticated user cannot read another user's document
    - Test unauthenticated client cannot write to `topics/` or `timelines/`
    - Test conversation messages are scoped to owner UID
    - _Requirements: 11.3, 7.2_
  - [ ]* 18.4 Write integration test for the `/api/chat` endpoint with a mock Vertex AI response
    - Test full request → Firestore write → response cycle
    - Test that both user and assistant messages are persisted
    - _Requirements: 11.3, 2.1, 2.2_
  - [ ]* 18.5 Write integration test for the `/api/progress` endpoints
    - Test GET returns seeded progress data
    - Test POST persists and returns updated progress
    - _Requirements: 11.3, 4.1_

- [ ] 19. Write property-based tests with fast-check
  - [ ]* 19.1 Write property test for content round-trip consistency (Property 2)
    - Use `fast-check` to generate arbitrary valid Markdown strings
    - Assert `parseMarkdown(serializeNodes(parseMarkdown(md)))` is deeply equal to `parseMarkdown(md)`
    - Run minimum 100 iterations
    - Tag: `// Feature: election-process-education, Property 2: content round-trip`
    - _Requirements: 11.4_
  - [ ]* 19.2 Write property test for `sanitizeInput` idempotency (Property 1)
    - Use `fast-check` to generate arbitrary strings including HTML and special characters
    - Assert `sanitizeInput(sanitizeInput(s)) === sanitizeInput(s)`
    - Run minimum 100 iterations
    - Tag: `// Feature: election-process-education, Property 1: sanitize idempotency`
    - _Requirements: 7.3, 11.1_
  - [ ]* 19.3 Write property test for `ProgressRing` stroke-dashoffset calculation
    - Use `fast-check` to generate `percent` values in `[0, 100]`
    - Assert `strokeDashoffset` is always in `[0, circumference]` and is monotonically decreasing as percent increases
    - Tag: `// Feature: election-process-education, Property 3: progress ring bounds`
    - _Requirements: 11.1_

- [ ] 20. Set up CI/CD pipeline with GitHub Actions
  - [ ] 20.1 Create `.github/workflows/ci.yml` that triggers on `push` and `pull_request` to `main`; runs `npm ci` + `npm run lint` + `npm test -- --run` in both `Frontend/` and `Backend/`; blocks merge if any step fails
    - _Requirements: 11.2, 11.5_
  - [ ] 20.2 Create `.github/workflows/deploy.yml` that triggers on push to `main` after CI passes; runs `npm run build` in `Frontend/`; deploys to Firebase Hosting using `firebase-tools` and a `FIREBASE_SERVICE_ACCOUNT` GitHub secret
    - _Requirements: 6.3, 11.2_

- [ ] 21. Final checkpoint — Ensure all tests pass
  - Run `npm test -- --run` in `Backend/` and `Frontend/` and confirm all tests pass
  - Run `npm run build` in `Frontend/` and confirm zero TypeScript/ESLint errors
  - Ask the user if any final adjustments are needed before the feature is considered complete

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 11, 16, 21) ensure incremental validation at natural boundaries
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
- The Firebase Emulator Suite should be used for all integration tests to avoid hitting production services
- Backend uses TypeScript (Node.js 18); Frontend uses JSX (React 18 + Vite) — match existing file extensions in each folder
