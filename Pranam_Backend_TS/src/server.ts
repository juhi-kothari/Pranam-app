import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/config';
import { connectDB } from '@/config/database';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { requestLogger } from '@/middleware/requestLogger';
import {
  securityHeaders,
  sanitizeInputs,
  detectSuspiciousRequests,
  requestTimeout
} from '@/middleware/security';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import publicationRoutes from '@/routes/publications';
import blogRoutes from '@/routes/blogs';
import cartRoutes from '@/routes/cart';
import orderRoutes from '@/routes/orders';
import bookmarkRoutes from '@/routes/bookmarks';
import commentRoutes from '@/routes/comments';

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Request timeout
app.use(requestTimeout(30000)); // 30 seconds

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Additional security headers
app.use(securityHeaders);

// Detect suspicious requests
app.use(detectSuspiciousRequests);

// CORS configuration
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInputs);

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/publications`, publicationRoutes);
app.use(`/api/${config.apiVersion}/blogs`, blogRoutes);
app.use(`/api/${config.apiVersion}/cart`, cartRoutes);
app.use(`/api/${config.apiVersion}/orders`, orderRoutes);
app.use(`/api/${config.apiVersion}/bookmarks`, bookmarkRoutes);
app.use(`/api/${config.apiVersion}/comments`, commentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Pranam API Server',
    version: config.apiVersion,
    documentation: '/api/docs',
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  void startServer();
}

export default app;
