# Civic Clarity — Backend API

Node.js + Express + TypeScript backend for the Civic Clarity India election education platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18 |
| Framework | Express 4 |
| Language | TypeScript 5 (strict) |
| Database | Cloud Firestore (Firebase Admin SDK) |
| Auth | Firebase Authentication (ID token verification) |
| AI | Vertex AI Gemini 1.5 Flash |
| Validation | Zod |
| Security | Helmet, CORS |
| Testing | Vitest + fast-check |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Firebase project ID and credentials
```

### 3. Add Firebase service account key
Download your service account key from Firebase Console → Project Settings → Service Accounts and save it as `serviceAccountKey.json` in the `Backend/` directory.

> ⚠️ Never commit `serviceAccountKey.json` to version control.

### 4. Seed Firestore data
```bash
npm run seed
```
This writes 10 India ECI election topics and the 2024 Lok Sabha timeline to Firestore.

### 5. Start development server
```bash
npm run dev
```
Server runs on `http://localhost:5000`.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Health check |
| GET | `/api/topics` | None | List all topics (filter: `?category=&locale=`) |
| GET | `/api/topics/:id` | None | Get single topic |
| GET | `/api/timeline` | None | List all timeline cycles |
| GET | `/api/timeline/:cycleId` | None | Get timeline (e.g. `india-2024`) |
| GET | `/api/progress` | Bearer token | Get user's learning progress |
| POST | `/api/progress` | Bearer token | Update topic completion |
| POST | `/api/chat` | Bearer token | Send message to AI assistant |

## Running Tests
```bash
npm run test:run
```

## Project Structure
```
Backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   ├── services/
│   │   ├── firebaseAdmin.ts  # Firebase Admin SDK singleton
│   │   ├── contentService.ts # Markdown parser + Zod schema validation
│   │   └── vertexService.ts  # Vertex AI Gemini integration
│   ├── middleware/
│   │   ├── verifyToken.ts    # Firebase ID token verification
│   │   └── sanitize.ts       # Input sanitisation
│   ├── routes/
│   │   ├── topics.ts         # GET /api/topics
│   │   ├── timeline.ts       # GET /api/timeline
│   │   ├── progress.ts       # GET/POST /api/progress
│   │   └── chat.ts           # POST /api/chat
│   └── scripts/
│       ├── seedTopics.ts     # Seed 10 ECI election topics
│       └── seedTimeline.ts   # Seed India 2024 Lok Sabha timeline
├── firestore.rules           # Firestore security rules
├── .env.example              # Environment variable template
├── package.json
└── tsconfig.json
```
