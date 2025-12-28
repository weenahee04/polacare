import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/prisma';
import { AppError } from './errorHandler';
import logger from '../config/logger';

// Define user roles
export type UserRole = 'patient' | 'doctor' | 'admin';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      if (!allowedRoles.includes(user.role as UserRole)) {
        logger.warn('Unauthorized access attempt', {
          userId: user.id,
          userRole: user.role,
          requiredRoles: allowedRoles,
          path: req.originalUrl
        });
        throw new AppError('Insufficient permissions', 403);
      }

      // Add role to request
      req.user.role = user.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience middleware
export const requireAdmin = requireRole('admin');
export const requireDoctor = requireRole('doctor', 'admin');
export const requirePatient = requireRole('patient', 'doctor', 'admin');
