import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '@/utils/jwt';
import { User } from '@/models';
import { CustomError } from './errorHandler';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new CustomError('Access token is required', 401);
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.isActive) {
      throw new CustomError('User account is deactivated', 401);
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError('Authentication failed', 401));
    }
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new CustomError('Admin access required', 403);
  }

  next();
};

/**
 * Middleware to optionally authenticate user (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail for optional auth, just continue without user
    logger.warn('Optional auth failed:', error);
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // For admin users, allow access to all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if the resource belongs to the user
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      throw new CustomError('Resource user ID not found', 400);
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      throw new CustomError('Access denied: You can only access your own resources', 403);
    }

    next();
  };
};

/**
 * Middleware to rate limit authentication attempts
 */
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const userAttempts = attempts.get(ip);
    
    if (!userAttempts) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > userAttempts.resetTime) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      throw new CustomError('Too many authentication attempts. Please try again later.', 429);
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Middleware to validate user status
 */
export const validateUserStatus = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401);
  }

  if (!req.user.isActive) {
    throw new CustomError('Account is deactivated', 403);
  }

  if (!req.user.isEmailVerified) {
    throw new CustomError('Email verification required', 403);
  }

  next();
};
