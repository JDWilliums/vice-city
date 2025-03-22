// Define a set of sample images from the public folder
const SAMPLE_WIKI_IMAGES = [
  '/images/wiki/sample1.jpg',
  '/images/wiki/sample2.jpg',
  '/images/wiki/sample3.jpg',
  '/images/wiki/sample4.jpg',
  '/images/wiki/sample5.jpg',
  '/images/wiki/sample6.jpg',
  '/images/gta6-1.png',
  '/images/gta6-2.png',
  '/images/gta6-3.png',
  '/images/gta6-4.png',
  '/images/gta6-5.png'
];

// Category-specific images
const CATEGORY_IMAGES = {
  locations: [
    '/images/wiki/location1.png',
    '/images/wiki/location2.png',
    '/images/gta6-1.png',
    '/images/gta6-3.png'
  ],
  characters: [
    '/images/wiki/character1.png',
    '/images/wiki/character2.png',
    '/images/gta6-2.png'
  ],
  vehicles: [
    '/images/wiki/vehicle1.png',
    '/images/wiki/vehicle2.png',
    '/images/gta6-4.png'
  ],
  weapons: [
    '/images/wiki/sample1.jpg',
    '/images/gta6-5.png'
  ],
  missions: [
    '/images/gta6-8.png',
    '/images/gta6-7.png'
  ],
  activities: [
    '/images/wiki/sample3.jpg',
    '/images/wiki/sample5.jpg',
    '/images/gta6-6.png'
  ],
  collectibles: [
    '/images/wiki/sample2.jpg',
    '/images/wiki/sample4.jpg',
    '/images/gta6-9.png'
  ],
  'gameplay-mechanics': [
    '/images/wiki/sample6.jpg',
    '/images/gta6-10.png',
    '/images/gta6-11.png'
  ],
  updates: [
    '/images/wiki/sample1.jpg',
    '/images/gta6-12.png'
  ],
  gangs: [
    '/images/wiki/sample3.jpg',
    '/images/gta6-13.png',
    '/images/gta6-14.png'
  ],
  media: [
    '/images/wiki/sample5.jpg',
    '/images/gta6-15.png'
  ],
  misc: [
    '/images/wiki/sample4.jpg',
    '/images/gta6-16.png'
  ]
};

/**
 * Get a random local image URL, optionally filtered by category
 * @param category Optional category to filter images by
 * @returns A random image URL
 */
export function getLocalImageUrl(category?: string): string {
  // If category is provided and exists in our category images, use those
  if (category && CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES]) {
    const categoryImages = CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES];
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    return categoryImages[randomIndex];
  }
  
  // Otherwise use a random image from the general pool
  const randomIndex = Math.floor(Math.random() * SAMPLE_WIKI_IMAGES.length);
  return SAMPLE_WIKI_IMAGES[randomIndex];
}

/**
 * Get multiple random local image URLs, optionally filtered by category
 * @param count Number of images to return
 * @param category Optional category to filter images by
 * @returns Array of random image URLs
 */
export function getMultipleLocalImageUrls(count: number = 3, category?: string): string[] {
  const images: string[] = [];
  
  // Determine which image pool to use
  let availableImages: string[];
  if (category && CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES]) {
    availableImages = [...CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES]];
  } else {
    availableImages = [...SAMPLE_WIKI_IMAGES];
  }
  
  // Get up to count unique images
  const imageCount = Math.min(count, availableImages.length);
  for (let i = 0; i < imageCount; i++) {
    if (availableImages.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    images.push(availableImages[randomIndex]);
    availableImages.splice(randomIndex, 1);
  }
  
  return images;
} 