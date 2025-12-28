/**
 * Medical Image Viewer Component
 * 
 * Displays medical images with lazy loading and thumbnail support.
 * Uses proxy endpoint for secure access.
 */

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MedicalImageViewerProps {
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    description?: string | null;
    eyeSide?: string;
    imageType?: string;
  }>;
  initialIndex?: number;
  onClose?: () => void;
}

const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  images,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([initialIndex]));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const token = localStorage.getItem('token');

  const getImageUrl = (image: typeof images[0], useThumbnail = false): string => {
    // Use proxy endpoint for secure access
    const imageId = image.id;
    const thumbnail = useThumbnail ? '?thumbnail=true' : '';
    return `${API_URL}/images/${imageId}/proxy${thumbnail}`;
  };

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLoadedImages((prev) => new Set([...prev, currentIndex - 1]));
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setLoadedImages((prev) => new Set([...prev, currentIndex + 1]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose?.();
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Image Container */}
      <div className="relative max-w-7xl max-h-full p-4">
        {/* Main Image */}
        <div className="relative">
          <img
            src={getImageUrl(currentImage)}
            alt={currentImage.description || 'Medical image'}
            className={`max-w-full max-h-[90vh] object-contain transition-transform ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            loading={loadedImages.has(currentIndex) ? 'eager' : 'lazy'}
            onError={(e) => {
              // Fallback to thumbnail if main image fails
              const target = e.target as HTMLImageElement;
              if (currentImage.thumbnailUrl) {
                target.src = getImageUrl(currentImage, true);
              }
            }}
          />

          {/* Image Info */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
            <p>{currentImage.description || 'Medical Image'}</p>
            {currentImage.eyeSide && (
              <p className="text-xs text-gray-300">
                Eye: {currentImage.eyeSide}
              </p>
            )}
            {currentImage.imageType && (
              <p className="text-xs text-gray-300">
                Type: {currentImage.imageType}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70"
          >
            {isZoomed ? (
              <ZoomOut className="w-5 h-5" />
            ) : (
              <ZoomIn className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (if multiple images) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index);
                setLoadedImages((prev) => new Set([...prev, index]));
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getImageUrl(image, true)} // Use thumbnail
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalImageViewer;



