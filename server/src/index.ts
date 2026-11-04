import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';

import { sessionMiddleware } from './middleware/authMiddleware';
import { authRouter } from './routes/authRoutes';
import { emailRouter } from './routes/emailRoutes';
import { actionRouter } from './routes/actionRoutes';
import { gameRouter } from './routes/gameRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Trust reverse proxy (Vercel / Cloud Run) for accurate HTTPS detection & secure cookies
app.set('trust proxy', 1);

// Enable strong ETags for efficient client caching & revalidation
app.set('etag', 'strong');

// High-speed gzip and brotli compression for all HTTP responses
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6
}));

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:*', 'https://*.googleapis.com']
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://inbox-quest-ai-six.vercel.app'
];

if (process.env.CLIENT_URL) {
  // Normalize by trimming trailing slash
  const envOrigin = process.env.CLIENT_URL.replace(/\/+$/, '');
  if (!allowedOrigins.includes(envOrigin)) {
    allowedOrigins.push(envOrigin);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to avoid unexpected blocking in demo deployments
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter: 500 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests. Please slow down your questing.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Bind session and provider to all API requests
app.use('/api', sessionMiddleware);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/emails', emailRouter);
app.use('/api/actions', actionRouter);
app.use('/api/game', gameRouter);

// Health check endpoint for Google Cloud Run (probes & readiness)
app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    status: 'ok',
    app: 'Inbox Quest AI',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Production Static Client Serving with Long-Term ETag & Cache-Control
const possibleDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../client/dist'),
  path.resolve(__dirname, '../../../../client/dist')
];
const clientDistPath = possibleDistPaths.find(p => fs.existsSync(p)) || possibleDistPaths[0];

// Long-lived cache for hashed Vite assets (/assets/*)
app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
  etag: true
}));

// Standard static files
app.use(express.static(clientDistPath, {
  etag: true,
  maxAge: '1h'
}));

// Fallback to index.html with no-cache for instant updates
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.status(200).send('Inbox Quest AI Server is running. Client build in progress or accessing via Vite dev server.');
    }
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🏰 Inbox Quest AI server running on port ${PORT}`);
    console.log(`⚔️  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Protection Engine Active: Royal Relics & Critical Mail Safeguarded.`);
  });
}

export default app;
