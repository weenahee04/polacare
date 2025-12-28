/**
 * Row-Level Security Middleware
 * 
 * Implements application-layer row-level security for strict data isolation.
 * This ensures patients can only access their own data.
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import logger from '../config/logger';

/**
 * Add patientId filter to query if user is a patient
 * This ensures patients can only see their own data
 */
export const addPatientFilter = <T extends { patientId?: string }>(
  req: AuthRequest,
  where: T
): T => {
  if (req.user?.role === 'patient') {
    where.patientId = req.user.id;
  }
  // Doctors and admins can see all data (no filter)
  return where;
};

/**
 * Verify that a resource belongs to the requesting patient
 * Throws 403 if patient tries to access another patient's resource
 */
export const verifyOwnership = async (
  req: AuthRequest,
  resourceId: string,
  getResource: (id: string) => Promise<{ patientId: string } | null>
): Promise<void> => {
  if (req.user?.role === 'patient') {
    const resource = await getResource(resourceId);
    
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }
    
    if (resource.patientId !== req.user.id) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        resourceId,
        resourcePatientId: resource.patientId,
        path: req.originalUrl
      });
      throw new AppError('Access denied: You can only access your own data', 403);
    }
  }
  // Doctors and admins can access any resource
};

/**
 * Middleware to ensure patient can only access their own resources
 * Usage: router.get('/cases/:id', authenticate, requirePatientOwnership('cases'), getCase)
 */
export const requirePatientOwnership = (resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role === 'patient') {
        const resourceId = req.params.id;
        
        // Import dynamically to avoid circular dependencies
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        let resource: { patientId: string } | null = null;
        
        switch (resourceType) {
          case 'cases':
            resource = await prisma.patientCase.findUnique({
              where: { id: resourceId },
              select: { patientId: true }
            });
            break;
          case 'medications':
            resource = await prisma.medication.findUnique({
              where: { id: resourceId },
              select: { patientId: true }
            });
            break;
          case 'vision-tests':
            resource = await prisma.visionTestResult.findUnique({
              where: { id: resourceId },
              select: { patientId: true }
            });
            break;
          default:
            throw new AppError(`Unknown resource type: ${resourceType}`, 500);
        }
        
        if (!resource) {
          throw new AppError('Resource not found', 404);
        }
        
        if (resource.patientId !== req.user.id) {
          logger.warn('Unauthorized access attempt', {
            userId: req.user.id,
            resourceId,
            resourceType,
            path: req.originalUrl
          });
          throw new AppError('Access denied: You can only access your own data', 403);
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper to build Prisma where clause with patient filter
 */
export const buildPatientWhere = <T extends Record<string, any>>(
  req: AuthRequest,
  baseWhere: T = {} as T
): T => {
  if (req.user?.role === 'patient') {
    return {
      ...baseWhere,
      patientId: req.user.id
    };
  }
  return baseWhere;
};

/**
 * Verify user can access a specific patient's data
 * Used by doctors/admins to access specific patient records
 */
export const verifyPatientAccess = async (
  req: AuthRequest,
  patientId: string
): Promise<void> => {
  if (req.user?.role === 'patient' && req.user.id !== patientId) {
    logger.warn('Patient trying to access another patient\'s data', {
      userId: req.user.id,
      requestedPatientId: patientId,
      path: req.originalUrl
    });
    throw new AppError('Access denied: You can only access your own data', 403);
  }
  
  // Doctors and admins can access any patient's data
};

