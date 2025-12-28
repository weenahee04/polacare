import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import logger from '../config/logger';
import { isValidJWTFormat } from './security';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
    hn: string;
    role?: string;
  };
}

// Token blacklist for logout (in production, use Redis)
const tokenBlacklist = new Set<string>();

// Cleanup blacklist periodically (every hour)
setInterval(() => {
  // In production, use Redis with TTL instead
  if (tokenBlacklist.size > 10000) {
    tokenBlacklist.clear();
  }
}, 60 * 60 * 1000);

export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);

    // Validate token format before processing
    if (!isValidJWTFormat(token)) {
      logger.warn('Invalid JWT format', { ip: req.ip, path: req.path });
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    // Check if token is blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Verify token with strict options
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'], // Only allow HS256
      complete: false
    }) as { userId: string; iat?: number; exp?: number };

    // Validate userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!decoded.userId || !uuidRegex.test(decoded.userId)) {
      logger.warn('Invalid userId in token', { ip: req.ip });
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phoneNumber: true,
        hn: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.isActive) {
      logger.warn('Deactivated user attempted access', { userId: user.id });
      res.status(401).json({ error: 'Account is deactivated' });
      return;
    }

    // Check if token was issued before password change (if iat exists)
    // This invalidates old tokens after password changes
    if (decoded.iat && user.updatedAt) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);
      if (tokenIssuedAt < user.updatedAt) {
        // Token was issued before last user update - might be stale
        // In strict mode, reject it. For now, just log.
        logger.info('Token issued before user update', { 
          userId: user.id, 
          tokenIat: tokenIssuedAt,
          userUpdated: user.updatedAt 
        });
      }
    }

    req.user = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      hn: user.hn,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT', { error: (error as Error).message, ip: req.ip });
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    logger.error('Authentication error', { error });
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional: Cookie-based authentication for frontend
export const authenticateFromCookie = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check Authorization header first
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }

  // Fall back to cookie
  const token = req.cookies?.polacare_token;
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  return authenticate(req, res, next);
};
