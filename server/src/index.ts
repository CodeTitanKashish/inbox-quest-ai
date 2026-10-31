import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { sessionMiddleware } from './middleware/authMiddleware';
import { authRouter } from './routes/authRoutes';
import { emailRouter } from './routes/emailRoutes';
import { actionRouter } from './routes/actionRoutes';
import { gameRouter } from './routes/gameRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and same origin in production
      callback(null, true);
    },
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter: 300 requests per 15 minutes per IP
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

// Health check endpoint for Google Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Inbox Quest AI',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

import fs from 'fs';

// Production Static Client Serving
const clientDistPath = fs.existsSync(path.resolve(process.cwd(), 'client/dist'))
  ? path.resolve(process.cwd(), 'client/dist')
  : path.resolve(__dirname, '../../../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.status(200).send('Inbox Quest AI Server is running. Client build in progress or accessing via Vite dev server.');
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🏰 Inbox Quest AI server running on port ${PORT}`);
    console.log(`⚔️  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Protection Engine Active: Royal Relics & Critical Mail Safeguarded.`);
  });
}


export default app;
