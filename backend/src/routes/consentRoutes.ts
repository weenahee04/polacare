/**
 * Consent Routes
 * 
 * PDPA consent management endpoints
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sensitiveRateLimiter } from '../middleware/security';
import {
  getConsents,
  createConsent,
  checkConsent,
  getVersions,
  revokeConsent
} from '../controllers/consentController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current terms versions (public info)
router.get('/versions', getVersions);

// Check if user has accepted current terms
router.get('/check', checkConsent);

// Get user's consent history
router.get('/', getConsents);

// Record new consent (rate limited)
router.post('/', sensitiveRateLimiter, createConsent);

// Revoke consent (rate limited)
router.delete('/:type', sensitiveRateLimiter, revokeConsent);

export default router;

