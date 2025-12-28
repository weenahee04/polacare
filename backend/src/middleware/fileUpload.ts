import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { AppError } from './errorHandler';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400));
  }
};

// Storage configuration
const storage = multer.memoryStorage();

// Multer configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
});

// Image processing middleware
export const processImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      next();
      return;
    }

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      throw new AppError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
    }

    // Process image: resize and optimize
    const processedImage = await sharp(req.file.buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Replace original buffer with processed image
    req.file.buffer = processedImage;
    req.file.size = processedImage.length;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Image processing failed', 500));
  }
};

// Cleanup old files (run periodically)
export const cleanupOldFiles = async (maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

