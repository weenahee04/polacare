/**
 * Image Upload Component
 * 
 * For staff (admin/doctor) to upload medical images.
 * Supports direct upload to S3/Supabase or backend upload.
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

interface ImageUploadProps {
  caseId: string;
  onUploadComplete?: (image: any) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  caseId,
  onUploadComplete,
  onError,
  maxSize = 10,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only images are allowed.`);
        return;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds ${maxSize}MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      validFiles.forEach((file) => {
        setUploads((prev) => {
          const newMap = new Map(prev);
          newMap.set(file.name, {
            fileName: file.name,
            progress: 0,
            status: 'pending'
          });
          return newMap;
        });
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caseId', caseId);
    formData.append('imageType', 'slit_lamp');
    formData.append('eyeSide', 'unknown');

    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.set(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });
      return newMap;
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) => {
            const newMap = new Map(prev);
            const upload = newMap.get(file.name);
            if (upload) {
              newMap.set(file.name, {
                ...upload,
                progress
              });
            }
            return newMap;
          });
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setUploads((prev) => {
            const newMap = new Map(prev);
            newMap.set(file.name, {
              fileName: file.name,
              progress: 100,
              status: 'success'
            });
            return newMap;
          });
          onUploadComplete?.(response.data);
        } else {
          throw new Error(xhr.responseText || 'Upload failed');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploads((prev) => {
          const newMap = new Map(prev);
          newMap.set(file.name, {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: 'Upload failed'
          });
          return newMap;
        });
        onError?.(`Failed to upload ${file.name}`);
      });

      xhr.open('POST', `${API_URL}/images/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error: any) {
      setUploads((prev) => {
        const newMap = new Map(prev);
        newMap.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: error.message || 'Upload failed'
        });
        return newMap;
      });
      onError?.(error.message || `Failed to upload ${file.name}`);
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter((file) => {
      const upload = uploads.get(file.name);
      return upload?.status === 'pending' || !upload;
    });

    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">
          Drag and drop images here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Max size: {maxSize}MB • JPEG, PNG, WebP
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleUploadAll}
              disabled={files.every((f) => {
                const upload = uploads.get(f.name);
                return upload?.status === 'uploading' || upload?.status === 'success';
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              Upload All
            </button>
          </div>

          {files.map((file) => {
            const upload = uploads.get(file.name);
            return (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(upload?.status || 'pending')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {upload?.status === 'uploading' && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload?.status === 'success' && (
                    <span className="text-xs text-green-600">Uploaded</span>
                  )}
                  {upload?.status === 'error' && (
                    <span className="text-xs text-red-600">{upload.error}</span>
                  )}
                  {upload?.status === 'pending' && (
                    <button
                      onClick={() => uploadFile(file)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Upload
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

