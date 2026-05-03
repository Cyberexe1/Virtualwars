# Civic Clarity — India Election Process Education Assistant

> An interactive, AI-powered web application that helps Indian citizens understand the election process, timelines, voting steps, and civic rights in an accessible and easy-to-follow way.

---

## Chosen Vertical

**Civic Education / Election Literacy**

India is the world's largest democracy with over 960 million registered voters, yet a significant portion of the electorate lacks awareness of basic electoral processes — voter registration, EVM usage, Model Code of Conduct, candidate nomination, and result certification. Civic Clarity addresses this gap by providing a structured, non-partisan, multilingual education platform built on Google's cloud infrastructure.

---

## Approach and Logic

### Problem Statement
Most election information in India is scattered across government portals (eci.gov.in, voters.eci.gov.in) in dense legal language. First-time voters, rural citizens, and non-English speakers struggle to navigate this information. Civic Clarity consolidates and simplifies this into an interactive learning experience.

### Design Philosophy
- **Non-partisan** — No political party or candidate is favoured. All content is sourced from ECI guidelines.
- **Accessible** — WCAG 2.1 AA compliant. Supports 9 Indian languages via Google Cloud Translation API.
- **Progressive** — Users can read topics page by page, track their progress, and resume where they left off.
- **Conversational** — An AI assistant (Vertex AI Gemini) answers natural language questions about elections.

### Architecture Decision
The application follows a **React SPA + Node.js API** architecture:

```
Browser (React + Vite)
    │
    ├── Firebase Auth      → Google OAuth, Email/Password, Anonymous login
    ├── Cloud Firestore    → Topics, Timeline, User Progress, Chat History
    ├── Firebase Storage   → Media assets
    ├── Google Analytics   → Usage tracking (privacy-safe)
    │
    └── Node.js Express API (Backend)
            ├── POST /api/chat        → Vertex AI Gemini (AI assistant)
            ├── POST /api/translate   → Google Cloud Translation API
            ├── POST /api/alerts      → Nodemailer (Gmail) email alerts
            ├── GET  /api/topics      → Firestore topic library
            ├── GET  /api/timeline    → Firestore election timeline
            └── GET/POST /api/progress → User learning progress
```

---

## How the Solution Works

### 1. User Authentication
Users can sign in via **Google OAuth**, **email/password**, or continue as a **guest**. Firebase Authentication manages sessions with automatic token refresh. Anonymous users can browse all content; signed-in users get progress tracking.

### 2. Election Topics Library
10 structured topics covering the full Indian election cycle are stored in **Cloud Firestore** and seeded via `Backend/seed.js`. Each topic is written in Markdown with headings, bullet lists, numbered steps, and factsheet cards.

Topics covered:
- Voter Registration (EPIC card, Form 6)
- Types of Ballots (EVM, VVPAT, Postal)
- Finding Your Polling Booth
- Election Commission of India: Structure & Powers
- Postal and Absentee Voting
- Election Security (EVM security, cVIGIL)
- Candidate Selection and Nomination
- Campaign Finance and Expenditure
- Results Certification and Government Formation
- Civic Rights and Duties of Indian Voters

### 3. Multi-Page Article Reader
Each topic is split into pages by `## H2` sections. Users navigate with **Next/Previous** buttons. Progress is saved to `localStorage`. On the last page, a **"Mark as Complete"** button appears. Once clicked, the topic card on the Topics page changes from "Read Topic" → "Resume Reading" → "Review".

### 4. AI Chat Assistant
The **Ask AI** page uses **Vertex AI Gemini 1.5 Flash** via a Node.js Cloud Function. The system prompt enforces non-partisan, plain-language responses about Indian elections. Conversation history (last 20 turns) is stored in Firestore per user. Users can navigate from any topic directly to the chat with the topic pre-loaded as context.

### 5. Election Timeline
An interactive visual timeline of the **2024 Lok Sabha General Elections** (7 phases, Apr 19 – Jun 1) is stored in Firestore. Users can download it as a PNG image using `html2canvas`. The **Get Alerts** button sends a formatted email via **Nodemailer + Gmail App Password** with all key election dates.

### 6. Google Translate Integration
On any topic detail page, users can translate the full article into 9 Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi) using the **Google Cloud Translation API**. Translation is done server-side via `POST /api/translate` to keep the API key secure.

### 7. Dashboard
The authenticated user dashboard shows:
- Real-time learning progress ring (% of topics completed)
- Topics Viewed and Questions Asked counters from Firestore
- "Continue Learning" cards — next unread topics from Firestore
- Recent activity feed — recently completed topics with dates
- Badges that unlock at 1, 3, 5, and 10 completed topics

---

## Google Services Used (8 Total)

| # | Service | Usage |
|---|---|---|
| 1 | **Firebase Authentication** | Google OAuth, Email/Password, Anonymous sign-in |
| 2 | **Cloud Firestore** | Topics, timeline, user progress, chat history |
| 3 | **Firebase Hosting** | SPA hosting with CDN, HTTPS, CSP headers |
| 4 | **Firebase Cloud Storage** | Media assets for topic content |
| 5 | **Google Analytics for Firebase** | Session tracking, topic completion events |
| 6 | **Vertex AI (Gemini 1.5 Flash)** | AI chat assistant for election Q&A |
| 7 | **Google Cloud Translation API** | Translate topics into 9 Indian languages |
| 8 | **Google Fonts** | Public Sans + Lexend typography (via fonts.googleapis.com) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js 22, Express 4, TypeScript |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| AI | Vertex AI Gemini 1.5 Flash |
| Translation | Google Cloud Translation API v2 |
| Email | Nodemailer + Gmail App Password |
| Image Export | html2canvas |
| Hosting | Firebase Hosting |

---

## Project Structure

```
NewProject/
├── Frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/        # NavBar, Footer, DashboardLayout, Sidebar, AlertModal
│   │   ├── context/           # AuthContext (Firebase Auth)
│   │   ├── hooks/             # useTopics, useProgress
│   │   ├── pages/             # Landing, Signup, Dashboard, Topics, TopicDetail, Chat, Timeline
│   │   └── firebase.js        # Firebase SDK initialisation
│   └── .env                   # Firebase web config (not committed)
│
├── Backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── routes/            # topics, timeline, progress, chat, alerts, translate
│   │   ├── services/          # firebaseAdmin, vertexService, emailService, translateService, contentService
│   │   └── index.ts           # Express app entry point
│   ├── seed.js                # Firestore data seeder (10 topics + timeline)
│   ├── firestore.rules        # Firestore security rules
│   └── .env                   # Backend secrets (not committed)
│
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase project with Authentication (Google + Email/Password) and Firestore enabled
- Google Cloud project with Translation API enabled (optional)
- Gmail account with App Password for email alerts (optional)

### 1. Clone and install

```bash
# Frontend
cd Frontend
npm install

# Backend
cd ../Backend
npm install
```

### 2. Configure environment variables

**Frontend** — create `Frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:5000
```

**Backend** — create `Backend/.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
VERTEX_AI_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
PORT=5000
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password
GOOGLE_TRANSLATE_API_KEY=your-translate-api-key
```

### 3. Add Firebase service account key
Download from Firebase Console → Project Settings → Service Accounts → Generate new private key.
Save as `Backend/serviceAccountKey.json`.

### 4. Seed Firestore data

```bash
cd Backend
node seed.js
```

### 5. Run the application

```bash
# Terminal 1 — Backend
cd Backend
npm run dev

# Terminal 2 — Frontend
cd Frontend
npm run dev
```

Open `http://localhost:5173`

---

## Assumptions Made

1. **India-specific scope** — All content, timelines, and election data are specific to India's electoral system (ECI, Lok Sabha, EVMs, VVPAT). The 2024 Lok Sabha election cycle is used as the primary timeline example.

2. **Firestore as source of truth** — Topic content and timelines are stored in Firestore and seeded via `seed.js`. The frontend reads directly from Firestore (no REST layer needed for public content).

3. **localStorage for progress** — User reading progress (current page, completion status) is stored in `localStorage` for simplicity. In production, this would sync to Firestore under `users/{uid}.progress`.

4. **Vertex AI requires billing** — The Gemini API via Vertex AI requires a Google Cloud project with billing enabled. The chat feature falls back to a static response engine if the backend is not running.

5. **Google Translate API key** — The translation feature requires a valid `GOOGLE_TRANSLATE_API_KEY`. Without it, the translate buttons show an error. The rest of the app works without it.

6. **Gmail App Password** — Email alerts require a Gmail account with 2-Step Verification and an App Password. Without it, the Get Alerts feature shows a connection error.

7. **Demo credentials** — The app includes demo credentials (`demo@civicclarity.in` / `India@2024`) for testing the email/password flow without a real Firebase user. These are mock credentials handled client-side.

8. **Non-partisan content** — All election content is written to be factual and non-partisan, sourced from ECI guidelines. The AI system prompt enforces this constraint.

---

## Demo

| Page | URL | Description |
|---|---|---|
| Landing | `/` | Hero, features, CTA |
| Sign In | `/signup` | Google OAuth + Email/Password + Guest |
| Dashboard | `/dashboard` | Progress, stats, recent activity |
| Topics | `/topics` | All 10 election topics with search + filter |
| Topic Detail | `/topics/:id` | Multi-page article reader with translate |
| AI Chat | `/chat` | Ask questions about Indian elections |
| Timeline | `/timeline` | 2024 Lok Sabha timeline, download + alerts |

---

*Built with ❤️ for India's democratic process · Civic Clarity © 2024*
