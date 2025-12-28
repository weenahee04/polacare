import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';
import logger from '../config/logger';

// ============================================
// RATE LIMITERS
// ============================================

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      phoneNumber: req.body?.phoneNumber 
    });
    res.status(429).json({ 
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60 
    });
  }
});

// Rate limiter for OTP requests (very strict)
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTP requests per hour
  message: 'Too many OTP requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('OTP rate limit exceeded', { 
      ip: req.ip,
      phoneNumber: req.body?.phoneNumber 
    });
    res.status(429).json({ 
      error: 'Too many OTP requests, please try again later.',
      retryAfter: 60 * 60 
    });
  }
});

// Rate limiter for AI endpoints (more expensive)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: 'AI service rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for sensitive operations (medication logging, profile updates)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limiter for image uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'Upload limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// INPUT SANITIZATION
// ============================================

// Basic XSS sanitization
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;');
}

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    // Skip sanitizing certain fields that need raw values
    if (['password', 'token', 'code'].includes(key)) {
      sanitized[key] = obj[key];
    } else {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
}

// Sanitize input middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// ============================================
// REQUEST VALIDATION
// ============================================

// Validate request size
export const validateRequestSize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    throw new AppError('Request payload too large', 413);
  }

  next();
};

// Validate content type for JSON endpoints
export const requireJSON = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'HEAD') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!contentType?.includes('multipart/form-data')) {
        res.status(415).json({ error: 'Content-Type must be application/json' });
        return;
      }
    }
  }
  next();
};

// ============================================
// SECURITY HEADERS
// ============================================

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Prevent caching of sensitive responses
  if (req.path.includes('/auth/') || req.path.includes('/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// ============================================
// JWT SECURITY HELPERS
// ============================================

// Constant-time string comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Validate JWT format before parsing
export function isValidJWTFormat(token: string): boolean {
  if (typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64url encoded
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64urlRegex.test(part));
}

// ============================================
// SUSPICIOUS ACTIVITY DETECTION
// ============================================

const suspiciousPatterns = [
  /\.\.\//,                    // Path traversal
  /<script/i,                  // XSS attempt
  /javascript:/i,              // XSS via javascript:
  /on\w+=/i,                   // Event handlers
  /union\s+select/i,           // SQL injection
  /;\s*drop/i,                 // SQL injection
  /'\s*or\s+'1'\s*=\s*'1/i,   // SQL injection
];

export const detectSuspiciousActivity = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkValue = (value: string): boolean => {
    if (typeof value !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && checkValue(value)) return true;
      if (typeof value === 'object' && checkObject(value)) return true;
    }
    return false;
  };

  // Check URL path
  if (checkValue(req.path)) {
    logger.warn('Suspicious path detected', { 
      ip: req.ip, 
      path: req.path,
      method: req.method 
    });
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // Check query parameters
  if (checkObject(req.query)) {
    logger.warn('Suspicious query params detected', { 
      ip: req.ip, 
      path: req.path,
      query: req.query 
    });
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // Check body
  if (checkObject(req.body)) {
    logger.warn('Suspicious body content detected', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  next();
};

