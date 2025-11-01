import crypto from 'crypto';
import { Request } from 'express';

/**
 * Generate a secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a string using SHA-256
 */
export const hashString = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate pincode (Indian format)
 */
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Check if password meets security requirements
 */
export const isStrongPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get client IP address from request
 */
export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const clientIP = req.connection.remoteAddress;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return clientIP || 'unknown';
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return generateSecureToken(32);
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

/**
 * Rate limiting key generator
 */
export const generateRateLimitKey = (req: Request, identifier?: string): string => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const baseKey = `${ip}:${hashString(userAgent)}`;
  
  if (identifier) {
    return `${baseKey}:${identifier}`;
  }
  
  return baseKey;
};

/**
 * Check if request is from a suspicious source
 */
export const isSuspiciousRequest = (req: Request): boolean => {
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file: any): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' };
  }
  
  return { isValid: true };
};

/**
 * Generate API key
 */
export const generateAPIKey = (): string => {
  const prefix = 'pk_';
  const key = generateSecureToken(24);
  return `${prefix}${key}`;
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  }
  
  return masked;
};
