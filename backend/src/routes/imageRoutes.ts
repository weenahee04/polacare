/**
 * Image Routes
 * 
 * Handles medical image upload, download, and management endpoints.
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { uploadRateLimiter } from '../middleware/security';
import {
  generateUploadUrl,
  uploadImage,
  generateDownloadUrl,
  proxyImage,
  getCaseImages,
  deleteImage
} from '../controllers/imageController';
import { upload, processImage } from '../middleware/fileUpload';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Generate signed upload URL (for direct client upload)
 * POST /api/v1/images/upload-url
 * 
 * Body: { fileName, contentType, caseId, eyeSide?, imageType? }
 * 
 * Authorization: Doctor/Admin (or patient for own cases)
 */
router.post('/upload-url', uploadRateLimiter, requireRole('patient', 'doctor', 'admin'), generateUploadUrl);

/**
 * Upload image through backend
 * POST /api/v1/images/upload
 * 
 * FormData: { image, caseId, eyeSide?, imageType?, description?, capturedAt? }
 * 
 * Authorization: Doctor/Admin (or patient for own cases)
 */
router.post(
  '/upload',
  uploadRateLimiter,
  requireRole('patient', 'doctor', 'admin'),
  upload.single('image'),
  processImage,
  uploadImage
);

/**
 * Get signed download URL
 * GET /api/v1/images/:id/download-url?expiresIn=3600
 * 
 * Authorization: Patient (own images), Doctor/Admin (all images)
 */
router.get('/:id/download-url', generateDownloadUrl);

/**
 * Proxy image with access control
 * GET /api/v1/images/:id/proxy?thumbnail=false
 * 
 * Authorization: Patient (own images), Doctor/Admin (all images)
 * 
 * Returns image with caching headers
 */
router.get('/:id/proxy', proxyImage);

/**
 * Get all images for a case
 * GET /api/v1/images/cases/:caseId
 * 
 * Authorization: Patient (own cases), Doctor/Admin (all cases)
 */
router.get('/cases/:caseId', getCaseImages);

/**
 * Delete image
 * DELETE /api/v1/images/:id
 * 
 * Authorization: Doctor/Admin only
 */
router.delete('/:id', requireRole('doctor', 'admin'), deleteImage);

export default router;

