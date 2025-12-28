/**
 * Consent Controller
 * 
 * Handles PDPA consent management
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

// Current terms version - increment when terms change
const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

/**
 * Get user's consent history
 * GET /api/v1/consents
 */
export const getConsents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const consents = await prisma.consent.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ consents });
  } catch (error) {
    next(error);
  }
};

/**
 * Record user consent
 * POST /api/v1/consents
 */
export const createConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { consentType, version } = req.body;

    if (!consentType) {
      throw new AppError('Consent type is required', 400);
    }

    // Validate consent type
    const validTypes = ['terms', 'privacy', 'data_usage', 'marketing'];
    if (!validTypes.includes(consentType)) {
      throw new AppError('Invalid consent type', 400);
    }

    // Determine version
    let consentVersion = version;
    if (!consentVersion) {
      consentVersion = consentType === 'terms' 
        ? CURRENT_TERMS_VERSION 
        : CURRENT_PRIVACY_VERSION;
    }

    // Check if already consented to this version
    const existing = await prisma.consent.findFirst({
      where: {
        userId: req.user!.id,
        consentType: consentType as any,
        termsVersion: consentVersion
      }
    });

    if (existing) {
      res.json({ 
        consent: existing,
        message: 'Consent already recorded'
      });
      return;
    }

    // Record consent
    const consent = await prisma.consent.create({
      data: {
        userId: req.user!.id,
        consentType: consentType as any,
        termsVersion: consentVersion,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    });

    logger.info('Consent recorded', {
      userId: req.user!.id,
      consentType,
      version: consentVersion
    });

    res.status(201).json({ consent });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has accepted current terms
 * GET /api/v1/consents/check
 */
export const checkConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type = 'terms' } = req.query;

    const currentVersion = type === 'terms' 
      ? CURRENT_TERMS_VERSION 
      : CURRENT_PRIVACY_VERSION;

    const consent = await prisma.consent.findFirst({
      where: {
        userId: req.user!.id,
        consentType: type as any,
        termsVersion: currentVersion
      }
    });

    res.json({
      hasConsent: !!consent,
      currentVersion,
      consentedAt: consent?.createdAt || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current terms versions
 * GET /api/v1/consents/versions
 */
export const getVersions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      terms: CURRENT_TERMS_VERSION,
      privacy: CURRENT_PRIVACY_VERSION
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke consent (for PDPA right to withdraw)
 * DELETE /api/v1/consents/:type
 */
export const revokeConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.params;

    // Only allow revoking non-essential consents
    if (type === 'terms') {
      throw new AppError('Cannot revoke terms consent. Please contact support to delete your account.', 400);
    }

    await prisma.consent.deleteMany({
      where: {
        userId: req.user!.id,
        consentType: type as any
      }
    });

    logger.info('Consent revoked', {
      userId: req.user!.id,
      consentType: type
    });

    res.json({ message: 'Consent revoked successfully' });
  } catch (error) {
    next(error);
  }
};

