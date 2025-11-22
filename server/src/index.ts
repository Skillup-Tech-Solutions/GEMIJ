import 'dotenv/config'; // Load env vars before any other imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/auth';
import submissionRoutes from './routes/submissions';
import editorRoutes from './routes/editor';
import reviewRoutes from './routes/reviews';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import publicationRoutes from './routes/publication';
import issueConferenceRoutes from './routes/issueConference';
import feedRoutes from './routes/feed';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Trust proxy headers (required for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000'),
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  skip: () => process.env.NODE_ENV !== 'production'
});

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Static file serving for uploads is removed as we now use Backblaze B2
// app.use('/uploads', ...);

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/admin', issueConferenceRoutes);
app.use('/feeds', feedRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Academic Journal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('Unhandled error:', error);

  if (error.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      error: 'File too large'
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Academic Journal API server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});