/**
 * Utility functions for image processing
 */

// Generate an optimized image URL based on provided parameters
export function getOptimizedImageUrl(
  imagePath: string,
  options: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg' | 'webp';
    download?: boolean;
    filename?: string;
  }
) {
  const { width, height, format = 'png', download = false, filename } = options;
  
  // Validate image path
  if (!imagePath) return imagePath;
  
  // For display (non-download), use Next.js Image component
  // This function is only needed for downloads or specific formats
  
  // Build the API URL with query parameters
  let url = `/api/image?path=${encodeURIComponent(imagePath)}`;
  
  // Add dimensions if provided
  if (width) url += `&width=${width}`;
  if (height) url += `&height=${height}`;
  
  // Add format
  if (format) url += `&format=${format}`;
  
  // Add download options
  if (download) {
    url += '&download=true';
    if (filename) url += `&filename=${encodeURIComponent(filename)}`;
  }
  
  return url;
}

// Available desktop resolutions
export const availableResolutions = [
  { id: '720p', name: '720p', width: 1280, height: 720 },
  { id: '1080p', name: '1080p', width: 1920, height: 1080 },
  { id: '1440p', name: '1440p', width: 2560, height: 1440 },
  { id: '4k', name: '4K', width: 3840, height: 2160 }
];

// Common phone resolutions
export const phoneResolutions = [
  { id: 'iphone-standard', name: 'iPhone Standard', width: 750, height: 1334 },
  { id: 'iphone-plus', name: 'iPhone Plus', width: 1080, height: 1920 },
  { id: 'iphone-x', name: 'iPhone X/11/12', width: 1125, height: 2436 },
  { id: 'iphone-promax', name: 'iPhone Pro Max', width: 1284, height: 2778 },
  { id: 'android-standard', name: 'Android Standard', width: 1080, height: 1920 },
  { id: 'android-large', name: 'Android Large', width: 1440, height: 2560 }
];

// Get resolution by device type
export function getResolutionsForDeviceType(deviceType: 'desktop' | 'phone') {
  return deviceType === 'phone' ? phoneResolutions : availableResolutions;
}

// Get specific phone resolution for a model
export function getPhoneResolution(modelId: string) {
  return phoneResolutions.find(resolution => resolution.id === modelId);
}

// Generate a placeholder URL for an image thumbnail
export function getPlaceholderUrl(imagePath: string, width = 20) {
  if (!imagePath) return '';
  return `/_next/image?url=${encodeURIComponent(imagePath)}&w=${width}&q=75`;
}

// Format the filename based on title and resolution
export function formatImageFilename(title: string, resolution: string) {
  return `GTA6-${title.replace(/\s+/g, '-')}-${resolution}`;
} 