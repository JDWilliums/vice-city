/**
 * Utility functions for image processing
 */

/**
 * Get an image URL with resolution folder support
 * 
 * This function generates a URL to fetch an image from resolution-specific folders.
 * It will look for the image in the following locations, in order:
 * 1. /{original-path}/{resolution}/{filename} - Original path with resolution subfolder
 * 2. /{resolution}/{filename} - Direct in resolution folder
 * 3. /{original-path}/{filename} - Original path (fallback)
 * 
 * @param imagePath Path to the original image
 * @param resolution Resolution identifier (e.g., '1080p')
 * @param download Whether to trigger a download
 * @param filename Custom filename for download
 * @returns URL to the image
 */
export const getImageUrl = (
  imagePath: string,
  resolution?: string,
  download: boolean = false,
  filename?: string
): string => {
  // Ensure path is valid
  if (!imagePath) return '';
  
  // Clean the path (keep leading slash for API parameter)
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct the API URL
  const params = new URLSearchParams();
  params.append('path', cleanPath);
  
  if (resolution) params.append('resolution', resolution);
  if (download) params.append('download', 'true');
  if (filename) params.append('filename', filename);
  
  return `/api/image?${params.toString()}`;
};

// Standard available resolutions for desktop
export const availableResolutions = [
  { id: '720p', width: 1280, height: 720, name: '720p HD' },
  { id: '1080p', width: 1920, height: 1080, name: '1080p Full HD' },
  { id: '1440p', width: 2560, height: 1440, name: '1440p QHD' },
  { id: '4k', width: 3840, height: 2160, name: '4K UHD' }
];

// Phone resolutions
export const phoneResolutions = [
  { id: 'iphone', width: 828, height: 1792, name: 'iPhone' },
  { id: 'android', width: 1080, height: 2340, name: 'Android' },
  { id: 'ipad', width: 2048, height: 2732, name: 'iPad' }
];

/**
 * Get available resolutions based on device type
 */
export const getResolutionsForDeviceType = (type: 'desktop' | 'phone') => {
  return type === 'desktop' ? availableResolutions : phoneResolutions;
};

/**
 * Get phone resolution data
 */
export const getPhoneResolution = (id: string) => {
  return phoneResolutions.find(r => r.id === id) || phoneResolutions[0];
};

/**
 * Get a placeholder URL for image thumbnail
 */
export const getPlaceholderUrl = (imagePath: string): string => {
  // Use thumbnail resolution folder for placeholders
  return getImageUrl(imagePath, 'thumb');
};

/**
 * Format the image filename for download based on original filename and resolution
 * @param imagePath Original image path
 * @param resolution Resolution identifier (e.g., '1080p')
 * @returns Formatted filename for download
 */
export const formatImageFilename = (imagePath: string, resolution: string): string => {
  // Extract the base filename (without extension)
  const baseName = imagePath.split('/').pop()?.split('.')[0] || 'image';
  
  // Format as basename-resolution
  return `${baseName}-${resolution}`;
}; 