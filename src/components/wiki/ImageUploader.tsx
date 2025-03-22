'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getLocalImageUrl, getMultipleLocalImageUrls } from '@/lib/localImageService';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (errorMessage: string) => void;
  label?: string;
  user: User;
  category?: string;
}

/**
 * Component for uploading a single image
 */
export default function ImageUploader({ 
  initialImageUrl, 
  onImageUploaded, 
  onError,
  label = 'Image',
  user,
  category
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUpload = async (file: File) => {
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError?.('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);

      // Instead of uploading to Firebase, we'll use a local image URL
      const localImageUrl = getLocalImageUrl(category);

      // Clear interval and finish "upload"
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setImageUrl(localImageUrl);
        onImageUploaded(localImageUrl);
        setIsUploading(false);
      }, 1500);

    } catch (error) {
      console.error('Error in image upload:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleQuickSelect = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);

    // Get a category-specific image if category is provided
    const localImageUrl = getLocalImageUrl(category);

    // Clear interval and finish "upload"
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setImageUrl(localImageUrl);
      onImageUploaded(localImageUrl);
      setIsUploading(false);
    }, 1200);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = useCallback(() => {
    setImageUrl(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageUploaded]);

  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}

      {!imageUrl ? (
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}
            ${isUploading ? 'opacity-75' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            {isUploading ? (
              <div className="mx-auto">
                <p className="text-sm text-gray-500 mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-2">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                <button
                  type="button"
                  onClick={handleQuickSelect}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Quick Select Sample Image
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-1 relative rounded-md overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 relative">
            <Image 
              src={imageUrl} 
              alt="Uploaded image" 
              fill 
              sizes="100%"
              style={{ objectFit: 'cover' }}
              className="rounded-md" 
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

interface MultipleImageUploaderProps {
  initialImageUrls?: string[];
  onImagesUploaded: (imageUrls: string[]) => void;
  onError?: (errorMessage: string) => void;
  label?: string;
  maxImages?: number;
  user: User;
  category?: string;
}

/**
 * Component for uploading multiple images
 */
export function MultipleImageUploader({
  initialImageUrls = [],
  onImagesUploaded,
  onError,
  label = 'Images',
  maxImages = 5,
  user,
  category
}: MultipleImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleUpload = async (files: FileList) => {
    if (imageUrls.length + files.length > maxImages) {
      onError?.(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);

      // Instead of uploading to Firebase, we'll use a local image URLs
      const newLocalImageUrls = getMultipleLocalImageUrls(files.length, category);
      
      // Complete the "upload"
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        const updatedImageUrls = [...imageUrls, ...newLocalImageUrls];
        setImageUrls(updatedImageUrls);
        onImagesUploaded(updatedImageUrls);
        setIsUploading(false);
      }, 1500);

    } catch (error) {
      console.error('Error in multiple image upload:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload images');
      setIsUploading(false);
    }
  };

  const handleQuickSelect = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);

    // Get multiple category-specific images
    const imagesToAdd = getMultipleLocalImageUrls(
      Math.min(3, maxImages - imageUrls.length),
      category
    );
    
    // Clear interval and finish "upload"
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      const newImageUrls = [...imageUrls, ...imagesToAdd];
      setImageUrls(newImageUrls);
      onImagesUploaded(newImageUrls);
      setIsUploading(false);
    }, 1200);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(updatedImageUrls);
    onImagesUploaded(updatedImageUrls);
  }, [imageUrls, onImagesUploaded]);

  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}

      {/* Grid of existing images */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative rounded-md overflow-hidden group">
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image 
                  src={url} 
                  alt={`Gallery image ${index + 1}`} 
                  fill 
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-md" 
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {imageUrls.length < maxImages && (
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'}
            ${isUploading ? 'opacity-75' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            {isUploading ? (
              <div className="mx-auto">
                <p className="text-sm text-gray-500 mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-2">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="multi-file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="multi-file-upload"
                        ref={fileInputRef}
                        name="multi-file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB each ({imageUrls.length}/{maxImages})
                </p>
                <button
                  type="button"
                  onClick={handleQuickSelect}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Quick Select Sample Images
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 