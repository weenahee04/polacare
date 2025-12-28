# Medical Image Storage Setup

## Overview

Medical images are stored using object storage (S3-compatible or Supabase Storage) with signed URLs for secure uploads and downloads. Images are optimized with thumbnails and lazy loading.

## Features

- ✅ S3-compatible storage (AWS S3, MinIO, etc.)
- ✅ Supabase Storage support
- ✅ Local storage fallback
- ✅ Signed upload URLs (direct client upload)
- ✅ Signed download URLs
- ✅ Proxy endpoint with access control
- ✅ Automatic thumbnail generation
- ✅ Lazy loading support
- ✅ Caching headers

## Database Schema

The `CaseImage` model includes:
- `imageUrl`: Full image URL
- `thumbnailUrl`: Thumbnail URL (400x400)
- `storageType`: 'local' | 's3' | 'supabase'
- `eyeSide`: 'left' | 'right' | 'both' | 'unknown'
- `capturedAt`: Timestamp when image was captured
- `imageType`: 'slit_lamp' | 'fundus' | 'other'
- `fileSize`: Size in bytes
- `mimeType`: MIME type

## Environment Variables

### For S3 Storage
```env
STORAGE_PROVIDER=s3
STORAGE_BUCKET=polacare-images
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_PUBLIC_URL=https://polacare-images.s3.amazonaws.com
```

### For Supabase Storage
```env
STORAGE_PROVIDER=supabase
STORAGE_BUCKET=medical-images
STORAGE_ENDPOINT=https://your-project.supabase.co/storage/v1
STORAGE_ACCESS_KEY_ID=your-service-role-key
STORAGE_SECRET_ACCESS_KEY=your-service-role-key
STORAGE_PUBLIC_URL=https://your-project.supabase.co/storage/v1/object/public/medical-images
```

### For Local Storage
```env
STORAGE_PROVIDER=local
STORAGE_PUBLIC_URL=http://localhost:5000
```

## API Endpoints

### 1. Generate Upload URL
**POST** `/api/v1/images/upload-url`

Generate signed URL for direct client upload.

**Request**:
```json
{
  "fileName": "slit-lamp.jpg",
  "contentType": "image/jpeg",
  "caseId": "uuid",
  "eyeSide": "left",
  "imageType": "slit_lamp"
}
```

**Response**:
```json
{
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "key": "cases/uuid/timestamp-uuid.jpg",
    "expiresIn": 3600
  }
}
```

### 2. Upload Image (Backend)
**POST** `/api/v1/images/upload`

Upload image through backend (with thumbnail generation).

**FormData**:
- `image`: File
- `caseId`: string
- `eyeSide`: 'left' | 'right' | 'both' | 'unknown'
- `imageType`: 'slit_lamp' | 'fundus' | 'other'
- `description`: string (optional)
- `capturedAt`: ISO date string (optional)

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "imageUrl": "https://...",
    "thumbnailUrl": "https://...",
    "caseId": "uuid",
    ...
  }
}
```

### 3. Get Download URL
**GET** `/api/v1/images/:id/download-url?expiresIn=3600`

Get signed download URL.

**Response**:
```json
{
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/...",
    "expiresIn": 3600
  }
}
```

### 4. Proxy Image
**GET** `/api/v1/images/:id/proxy?thumbnail=false`

Proxy image with access control and caching headers.

**Response**: Image binary with headers:
- `Content-Type`: image/jpeg
- `Cache-Control`: public, max-age=31536000, immutable

### 5. Get Case Images
**GET** `/api/v1/images/cases/:caseId`

Get all images for a case.

**Response**:
```json
{
  "data": {
    "images": [...],
    "total": 5
  }
}
```

### 6. Delete Image
**DELETE** `/api/v1/images/:id`

Delete image (Doctor/Admin only).

## Frontend Usage

### Upload Component
```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  caseId={caseId}
  onUploadComplete={(image) => {
    console.log('Uploaded:', image);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

### Image Viewer
```tsx
import MedicalImageViewer from '@/components/MedicalImageViewer';

<MedicalImageViewer
  images={images}
  initialIndex={0}
  onClose={() => setViewerOpen(false)}
/>
```

### Display Image with Proxy
```tsx
const imageUrl = `${API_URL}/images/${imageId}/proxy`;
<img src={imageUrl} alt="Medical image" loading="lazy" />
```

## Access Control

- **Patients**: Can only view images linked to their own cases
- **Doctors/Admins**: Can view all images
- **Upload**: Patients can upload to own cases, Doctors/Admins to any case
- **Delete**: Only Doctors/Admins can delete

## Optimization

1. **Thumbnails**: Automatically generated (400x400)
2. **Lazy Loading**: Frontend uses `loading="lazy"`
3. **Caching**: Images cached for 1 year (`max-age=31536000`)
4. **Compression**: Images optimized with Sharp (85% quality)
5. **Resize**: Max 1920x1920 (maintains aspect ratio)

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Configure Environment
Add storage configuration to `.env`

### 3. Run Migration
```bash
npm run prisma:migrate
```

### 4. Test Upload
```bash
curl -X POST http://localhost:5000/api/v1/images/upload \
  -H "Authorization: Bearer <token>" \
  -F "image=@test.jpg" \
  -F "caseId=<case-id>"
```

## Troubleshooting

### Issue: "Storage client not initialized"
**Solution**: Check environment variables are set correctly.

### Issue: "Access denied"
**Solution**: Verify user has permission to access the case.

### Issue: "Image not found"
**Solution**: Check image exists in storage and database.

---

**Status**: Ready for use ✅

