import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import postRoutes from './routes/postRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    'ERROR: JWT_SECRET must be set to a strong random value (32+ chars). Refusing to start.'
  );
  process.exit(1);
}

const allowedOrigins = [
  ...(process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  process.env.PUBLIC_URL,
]
  .filter(Boolean)
  .map((o) => o.trim());

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
      },
    },
  })
);
app.use((req, res, next) => {
  const origin = req.headers.origin;

  let sameOrigin = false;
  if (origin) {
    try {
      sameOrigin = new URL(origin).host === req.headers.host;
    } catch {
      sameOrigin = false;
    }
  }

  if (!origin || sameOrigin || allowedOrigins.includes(origin)) {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
      );
      return res.sendStatus(204);
    }
    return next();
  }

  res.status(403).json({ message: 'Not allowed by CORS' });
});
app.use(express.json({ limit: '100kb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild = fs.existsSync(path.join(distPath, 'index.html'));

if (hasFrontendBuild) {
  app.use(express.static(distPath));
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);

if (hasFrontendBuild) {
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((_, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Not allowed by CORS' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value entered' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
