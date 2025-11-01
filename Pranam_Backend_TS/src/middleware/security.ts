import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { CustomError } from './errorHandler';
import { getClientIP, isSuspiciousRequest, sanitizeInput } from '@/utils/security';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';

/**
 * Enhanced rate limiting middleware
 */
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: {
      error: options.message || 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: (req: Request) => {
      return getClientIP(req);
    },
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
      });
      
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(options.windowMs! / 1000) || 900,
      });
    },
  });
};

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * API rate limiting for general endpoints
 */
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many API requests, please try again later.',
});

/**
 * Strict rate limiting for sensitive operations
 */
export const sensitiveOperationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: 'Too many sensitive operations, please try again later.',
});

/**
 * Input sanitization middleware
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      }
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeInput(req.query[key] as string);
        }
      }
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      for (const key in req.params) {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeInput(req.params[key]);
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    next(new CustomError('Input validation failed', 400));
  }
};

/**
 * Suspicious request detection middleware
 */
export const detectSuspiciousRequests = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (isSuspiciousRequest(req)) {
      logger.warn('Suspicious request detected', {
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
      });

      // In production, you might want to block these requests
      if (config.nodeEnv === 'production') {
        throw new CustomError('Access denied', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Request size limiting middleware
 */
export const limitRequestSize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        throw new CustomError('Request entity too large', 413);
      }
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size: string): number => {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  
  if (!match) {
    throw new Error('Invalid size format');
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * units[unit]);
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS header for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * API key validation middleware (for future use)
 */
export const validateAPIKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    throw new CustomError('API key is required', 401);
  }
  
  // Validate API key format
  if (!apiKey.startsWith('pk_') || apiKey.length !== 51) {
    throw new CustomError('Invalid API key format', 401);
  }
  
  // TODO: Implement API key validation against database
  // For now, just pass through
  next();
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          url: req.url,
          method: req.method,
          ip: getClientIP(req),
        });
        
        res.status(408).json({
          success: false,
          error: 'Request timeout',
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    res.on('close', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};
