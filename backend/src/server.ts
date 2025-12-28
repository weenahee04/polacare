import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, RequestWithId } from './middleware/requestLogger';
import { securityHeaders, sanitizeInput, detectSuspiciousActivity } from './middleware/security';
import { healthCheck } from './middleware/healthCheck';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import logger from './config/logger';

// Routes
import authRoutes from './routes/authRoutes';
import caseRoutes from './routes/caseRoutes';
import medicationRoutes from './routes/medicationRoutes';
import visionTestRoutes from './routes/visionTestRoutes';
import articleRoutes from './routes/articleRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import doctorRoutes from './routes/doctorRoutes';
import imageRoutes from './routes/imageRoutes';
import consentRoutes from './routes/consentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware - Apply early
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(securityHeaders);

// CORS with strict origin checking
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS rejected', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}));

// Compression
app.use(compression());

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Input sanitization and suspicious activity detection
app.use(sanitizeInput);
app.use(detectSuspiciousActivity);

// Global rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: RequestWithId) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({ 
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
    });
  }
});
app.use('/api/', limiter);

// Health check
app.get('/health', healthCheck);

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/cases`, caseRoutes);
app.use(`/api/${API_VERSION}/medications`, medicationRoutes);
app.use(`/api/${API_VERSION}/vision-tests`, visionTestRoutes);
app.use(`/api/${API_VERSION}/articles`, articleRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/doctor`, doctorRoutes);
app.use(`/api/${API_VERSION}/images`, imageRoutes);
app.use(`/api/${API_VERSION}/consents`, consentRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Try to connect to database using Prisma
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database connected successfully');
      console.log('✅ Database connected');
    } catch (dbError) {
      logger.warn('Database connection failed, but continuing without DB', { error: dbError });
      console.warn('⚠️  Database not connected. Some features may not work.');
      console.warn('   To fix: Make sure PostgreSQL is running and check DATABASE_URL in .env');
    }
    
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        apiVersion: API_VERSION,
        environment: process.env.NODE_ENV || 'development'
      });
      console.log('');
      console.log('🚀 POLACARE Backend Server Started!');
      console.log('');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 API: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log('');
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error('Failed to start server', { error });
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
