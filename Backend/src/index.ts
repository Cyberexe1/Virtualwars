import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Import routes
import topicsRouter from './routes/topics';
import timelineRouter from './routes/timeline';
import progressRouter from './routes/progress';
import chatRouter from './routes/chat';
import alertsRouter from './routes/alerts';
import translateRouter from './routes/translate';

const app = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com'],
    },
  },
  // Prevent server fingerprinting
  hidePoweredBy: true,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // In production: reject requests with no origin (direct curl/Postman access)
    // In development: allow no-origin for local testing convenience
    if (!origin) {
      if (IS_PROD) {
        callback(new Error('CORS: direct requests not allowed in production'));
      } else {
        callback(null, true);
      }
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Health Check (restricted — no sensitive info exposed) ───────────────────
app.get('/health', (_req, res) => {
  // Only return minimal status — no timestamps or service names that aid fingerprinting
  res.json({ status: 'ok' });
});

import * as path from 'path';

// ─── Serve React frontend static files in production ─────────────────────────
if (IS_PROD) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath, {
    maxAge: '1y',        // cache static assets for 1 year (Vite uses content hashes)
    etag: true,
  }));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/topics', topicsRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/progress', progressRouter);
app.use('/api/chat', chatRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/translate', translateRouter);

// ─── 404 Handler — SPA fallback for React Router ─────────────────────────────
app.use((_req, res) => {
  // In production, serve React's index.html for all non-API routes
  // so React Router handles client-side navigation
  if (IS_PROD) {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Route not found', code: 'not-found' });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Never expose internal error details in production
  const message = IS_PROD ? 'Internal server error' : err.message;
  res.status(500).json({ error: message, code: 'internal-error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Civic Clarity API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

export default app;
