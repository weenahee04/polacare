/**
 * Image Controller
 * 
 * Handles medical image upload, download, and management.
 * Includes access control and thumbnail generation.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { AppError } from '../middleware/errorHandler';
import storageService from '../services/storageService';
import prisma from '../config/prisma';
import { buildPatientWhere, verifyOwnership } from '../middleware/rowLevelSecurity';
import logger from '../config/logger';
import { upload, processImage } from '../middleware/fileUpload';

/**
 * Generate signed upload URL
 * POST /api/v1/images/upload-url
 */
export const generateUploadUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileName, contentType, caseId, eyeSide, imageType } = req.body;

    if (!fileName || !contentType || !caseId) {
      throw new AppError('fileName, contentType, and caseId are required', 400);
    }

    // Verify case exists and user has access
    const caseRecord = await prisma.patientCase.findUnique({
      where: { id: caseId }
    });

    if (!caseRecord) {
      throw new AppError('Case not found', 404);
    }

    // Check access: patient can only upload to their own cases
    if (req.user?.role === 'patient' && caseRecord.patientId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Generate upload URL
    const result = await storageService.generateUploadUrl(fileName, contentType, {
      folder: `cases/${caseId}`,
      generateThumbnail: true,
      thumbnailSize: { width: 400, height: 400 }
    });

    res.json({
      data: {
        uploadUrl: result.uploadUrl,
        key: result.key,
        expiresIn: result.expiresIn
      },
      message: 'Upload URL generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload image through backend
 * POST /api/v1/images/upload
 */
export const uploadImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const { caseId, eyeSide, imageType, description, capturedAt } = req.body;

    if (!caseId) {
      throw new AppError('caseId is required', 400);
    }

    // Verify case exists and user has access
    const caseRecord = await prisma.patientCase.findUnique({
      where: { id: caseId }
    });

    if (!caseRecord) {
      throw new AppError('Case not found', 404);
    }

    // Check access
    if (req.user?.role === 'patient' && caseRecord.patientId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Upload image with thumbnail
    const uploadResult = await storageService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        folder: `cases/${caseId}`,
        generateThumbnail: true,
        thumbnailSize: { width: 400, height: 400 }
      }
    );

    // Get max order for this case
    const maxOrder = await prisma.caseImage.findFirst({
      where: { caseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    // Create image record
    const image = await prisma.caseImage.create({
      data: {
        caseId,
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        storageType: process.env.STORAGE_PROVIDER || 'local',
        imageType: imageType || 'slit_lamp',
        eyeSide: eyeSide || 'unknown',
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
        description,
        order: (maxOrder?.order || 0) + 1,
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType
      }
    });

    logger.info('Image uploaded', {
      imageId: image.id,
      caseId,
      userId: req.user?.id
    });

    res.status(201).json({
      data: image,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get signed download URL for image
 * GET /api/v1/images/:id/download-url
 */
export const generateDownloadUrl = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { expiresIn = 3600 } = req.query;

    // Get image with case
    const image = await prisma.caseImage.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            patientId: true
          }
        }
      }
    });

    if (!image) {
      throw new AppError('Image not found', 404);
    }

    // Check access: patient can only access their own images
    if (req.user?.role === 'patient' && image.case.patientId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Extract key from URL
    const key = extractKeyFromUrl(image.imageUrl);

    // Generate signed download URL
    const result = await storageService.generateDownloadUrl(
      key,
      parseInt(expiresIn as string)
    );

    res.json({
      data: {
        downloadUrl: result.downloadUrl,
        expiresIn: result.expiresIn
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Proxy image for patient access (with access control)
 * GET /api/v1/images/:id/proxy
 */
export const proxyImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { thumbnail = false } = req.query;

    // Get image with case
    const image = await prisma.caseImage.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            patientId: true
          }
        }
      }
    });

    if (!image) {
      throw new AppError('Image not found', 404);
    }

    // Check access: patient can only access their own images
    if (req.user?.role === 'patient' && image.case.patientId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Use thumbnail if requested
    const imageUrl = thumbnail && image.thumbnailUrl ? image.thumbnailUrl : image.imageUrl;
    const key = extractKeyFromUrl(imageUrl);

    // Get image buffer
    const { buffer, contentType } = await storageService.getImageBuffer(key);

    // Set caching headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Get images for a case
 * GET /api/v1/cases/:caseId/images
 */
export const getCaseImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { caseId } = req.params;

    // Verify case exists and user has access
    const caseRecord = await prisma.patientCase.findUnique({
      where: { id: caseId }
    });

    if (!caseRecord) {
      throw new AppError('Case not found', 404);
    }

    // Check access
    if (req.user?.role === 'patient' && caseRecord.patientId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Get images
    const images = await prisma.caseImage.findMany({
      where: { caseId },
      orderBy: { order: 'asc' }
    });

    res.json({
      data: {
        images,
        total: images.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image
 * DELETE /api/v1/images/:id
 */
export const deleteImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get image with case
    const image = await prisma.caseImage.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            patientId: true
          }
        }
      }
    });

    if (!image) {
      throw new AppError('Image not found', 404);
    }

    // Check access: only doctor/admin can delete
    if (req.user?.role === 'patient') {
      throw new AppError('Access denied: Only staff can delete images', 403);
    }

    // Delete from storage
    const key = extractKeyFromUrl(image.imageUrl);
    await storageService.deleteImage(key);

    if (image.thumbnailUrl) {
      const thumbnailKey = extractKeyFromUrl(image.thumbnailUrl);
      await storageService.deleteImage(thumbnailKey);
    }

    // Delete from database
    await prisma.caseImage.delete({
      where: { id }
    });

    logger.info('Image deleted', {
      imageId: id,
      userId: req.user?.id
    });

    res.json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extract storage key from URL
 */
function extractKeyFromUrl(url: string): string {
  // Extract key from various URL formats
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // S3 or Supabase URL
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  } else if (url.startsWith('/uploads/')) {
    // Local storage
    return url.replace('/uploads/', '');
  } else {
    // Assume it's already a key
    return url;
  }
}

// Export helper
export { extractKeyFromUrl };

