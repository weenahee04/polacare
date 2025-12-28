/**
 * Storage Service
 * 
 * Handles image storage with S3-compatible or Supabase Storage.
 * Supports signed URLs for secure uploads and downloads.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';

// Storage provider type
type StorageProvider = 's3' | 'supabase' | 'local';

interface StorageConfig {
  provider: StorageProvider;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string; // For S3-compatible or Supabase
  publicUrl?: string; // Base public URL
}

interface UploadOptions {
  folder?: string;
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  maxSize?: number;
}

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  key: string;
  size: number;
  mimeType: string;
}

class StorageService {
  private config: StorageConfig;
  private s3Client: S3Client | null = null;

  constructor() {
    this.config = {
      provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'local',
      bucket: process.env.STORAGE_BUCKET,
      region: process.env.STORAGE_REGION || 'us-east-1',
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      endpoint: process.env.STORAGE_ENDPOINT,
      publicUrl: process.env.STORAGE_PUBLIC_URL
    };

    // Initialize S3 client if using S3 or S3-compatible storage
    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.config.bucket || !this.config.accessKeyId || !this.config.secretAccessKey) {
        logger.warn('Storage credentials not configured, falling back to local storage');
        this.config.provider = 'local';
      } else {
        this.s3Client = new S3Client({
          region: this.config.region,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey
          },
          endpoint: this.config.endpoint,
          forcePathStyle: this.config.provider === 'supabase' // Supabase requires path-style
        });
      }
    }
  }

  /**
   * Generate signed upload URL
   * Client can use this URL to upload directly to storage
   */
  async generateUploadUrl(
    fileName: string,
    contentType: string,
    options: UploadOptions = {}
  ): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
    const key = this.generateKey(fileName, options.folder);
    const expiresIn = 3600; // 1 hour

    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.s3Client) {
        throw new AppError('Storage client not initialized', 500);
      }

      const command = new PutObjectCommand({
        Bucket: this.config.bucket!,
        Key: key,
        ContentType: contentType,
        ACL: 'private' // Private by default, use proxy for access
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        uploadUrl,
        key,
        expiresIn
      };
    }

    // Local storage - return endpoint for direct upload
    return {
      uploadUrl: `/api/v1/storage/upload?key=${key}`,
      key,
      expiresIn
    };
  }

  /**
   * Generate signed download URL
   * For secure access to private images
   */
  async generateDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<{ downloadUrl: string; expiresIn: number }> {
    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.s3Client) {
        throw new AppError('Storage client not initialized', 500);
      }

      const command = new GetObjectCommand({
        Bucket: this.config.bucket!,
        Key: key
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        downloadUrl,
        expiresIn
      };
    }

    // Local storage - return public URL or proxy endpoint
    const publicUrl = this.config.publicUrl || '';
    return {
      downloadUrl: `${publicUrl}/${key}`,
      expiresIn
    };
  }

  /**
   * Upload image buffer to storage
   * Used when uploading through backend (not direct client upload)
   */
  async uploadImage(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const key = this.generateKey(fileName, options.folder);
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default

    if (buffer.length > maxSize) {
      throw new AppError(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`, 400);
    }

    // Process image: resize and optimize
    const processedImage = await sharp(buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    let thumbnailUrl: string | undefined;

    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailSize = options.thumbnailSize || { width: 400, height: 400 };
      const thumbnail = await sharp(buffer)
        .resize(thumbnailSize.width, thumbnailSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailKey = this.generateThumbnailKey(key);
      await this.uploadBuffer(thumbnail, thumbnailKey, 'image/jpeg');
      thumbnailUrl = await this.getPublicUrl(thumbnailKey);
    }

    // Upload main image
    await this.uploadBuffer(processedImage, key, contentType);
    const url = await this.getPublicUrl(key);

    return {
      url,
      thumbnailUrl,
      key,
      size: processedImage.length,
      mimeType: contentType
    };
  }

  /**
   * Upload buffer to storage
   */
  private async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<void> {
    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.s3Client) {
        throw new AppError('Storage client not initialized', 500);
      }

      const command = new PutObjectCommand({
        Bucket: this.config.bucket!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'private'
      });

      await this.s3Client.send(command);
    } else {
      // Local storage
      const fs = await import('fs');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, key);
      fs.writeFileSync(filePath, buffer);
    }
  }

  /**
   * Get public URL for a key
   */
  private async getPublicUrl(key: string): Promise<string> {
    if (this.config.provider === 's3') {
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    } else if (this.config.provider === 'supabase') {
      return `${this.config.publicUrl}/${key}`;
    } else {
      // Local storage
      return `/uploads/${key}`;
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(key: string): Promise<void> {
    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.s3Client) {
        throw new AppError('Storage client not initialized', 500);
      }

      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket!,
        Key: key
      });

      await this.s3Client.send(command);
    } else {
      // Local storage
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Generate unique key for file
   */
  private generateKey(fileName: string, folder?: string): string {
    const ext = fileName.split('.').pop() || 'jpg';
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    const baseKey = `${timestamp}-${uniqueId}.${ext}`;
    return folder ? `${folder}/${baseKey}` : baseKey;
  }

  /**
   * Generate thumbnail key
   */
  private generateThumbnailKey(originalKey: string): string {
    const parts = originalKey.split('.');
    const ext = parts.pop();
    return `${parts.join('.')}_thumb.${ext}`;
  }

  /**
   * Get image buffer from storage (for proxy)
   */
  async getImageBuffer(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    if (this.config.provider === 's3' || this.config.provider === 'supabase') {
      if (!this.s3Client) {
        throw new AppError('Storage client not initialized', 500);
      }

      const command = new GetObjectCommand({
        Bucket: this.config.bucket!,
        Key: key
      });

      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      const buffer = Buffer.concat(chunks);
      const contentType = response.ContentType || 'image/jpeg';

      return { buffer, contentType };
    } else {
      // Local storage
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', key);

      if (!fs.existsSync(filePath)) {
        throw new AppError('Image not found', 404);
      }

      const buffer = fs.readFileSync(filePath);
      const ext = key.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      return { buffer, contentType };
    }
  }
}

export default new StorageService();

