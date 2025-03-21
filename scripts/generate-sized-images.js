const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define resolutions to generate
const RESOLUTIONS = [
  { id: '720p', width: 1280, height: 720 },
  { id: '1080p', width: 1920, height: 1080 },
  { id: '1440p', width: 2560, height: 1440 },
  { id: '4k', width: 3840, height: 2160 },
  { id: 'iphone', width: 828, height: 1792 },
  { id: 'android', width: 1080, height: 2340 },
  { id: 'ipad', width: 2048, height: 2732 },
  { id: 'thumb', width: 200, height: 150 } // Thumbnails
];

// Source directory (relative to project root)
const SOURCE_DIR = 'public/unprocessed-images';
// Make sure our source directory exists
const fullSourceDir = path.join(process.cwd(), SOURCE_DIR);

// Log with timestamp
const log = (message) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
};

// Create all resolution directories if they don't exist
async function createResolutionDirectories() {
  for (const resolution of RESOLUTIONS) {
    const resDir = path.join(process.cwd(), 'public', resolution.id);
    if (!fs.existsSync(resDir)) {
      log(`Creating directory: ${resolution.id}`);
      fs.mkdirSync(resDir, { recursive: true });
    }
  }
}

// Process a single image
async function processImage(filePath) {
  try {
    // Skip if not an image
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      log(`Skipping non-image file: ${filePath}`);
      return;
    }
    
    log(`Processing: ${filePath}`);
    
    // Get the base name without extension
    const filename = path.basename(filePath);
    const baseName = path.basename(filePath, ext);
    
    // Get image dimensions
    const metadata = await sharp(filePath).metadata();
    
    // Generate each resolution
    for (const resolution of RESOLUTIONS) {
      const outputDir = path.join(process.cwd(), 'public', resolution.id);
      const outputPath = path.join(outputDir, filename);
      
      log(`  Generating ${resolution.id} (${resolution.width}x${resolution.height})...`);
      
      // Calculate dimensions while preserving aspect ratio
      let resizeOptions = {};
      if (metadata.width > metadata.height) {
        // Landscape orientation
        resizeOptions = {
          width: resolution.width,
          height: Math.round(resolution.width * (metadata.height / metadata.width)),
          fit: 'inside'
        };
      } else {
        // Portrait or square orientation
        resizeOptions = {
          width: Math.round(resolution.height * (metadata.width / metadata.height)),
          height: resolution.height,
          fit: 'inside'
        };
      }
      
      // Generate the resized image
      await sharp(filePath)
        .resize(resizeOptions)
        .toFile(outputPath);
      
      log(`  ✓ Created ${resolution.id}/${filename}`);
    }
    
    // Also save the original in the public images directory (for fallback)
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }
    
    const originalOutputPath = path.join(publicImagesDir, filename);
    fs.copyFileSync(filePath, originalOutputPath);
    log(`  ✓ Copied original to images/${filename}`);
    
    // Delete the original from the unprocessed folder
    fs.unlinkSync(filePath);
    log(`  ✓ Removed original from unprocessed-images folder`);
    
    log(`✅ Completed: ${filename}`);
  } catch (error) {
    log(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

// Process all images in the unprocessed-images directory
async function processAllImages() {
  try {
    const entries = fs.readdirSync(fullSourceDir, { withFileTypes: true });
    
    // Process only files (not directories)
    const files = entries.filter(entry => entry.isFile())
      .map(entry => path.join(fullSourceDir, entry.name));
    
    if (files.length === 0) {
      log('No files found in the unprocessed-images directory.');
      return;
    }
    
    log(`Found ${files.length} files to process.`);
    
    for (const file of files) {
      await processImage(file);
    }
  } catch (error) {
    log(`❌ Error processing directory: ${error.message}`);
  }
}

// Main function
async function main() {
  try {
    // Check if source directory exists
    if (!fs.existsSync(fullSourceDir)) {
      log(`❌ Source directory not found: ${fullSourceDir}`);
      return;
    }
    
    log(`🔍 Starting image processing from ${fullSourceDir}`);
    
    // Create resolution directories
    await createResolutionDirectories();
    
    // Process all images
    await processAllImages();
    
    log('✅ All images processed successfully');
  } catch (error) {
    log(`❌ Error: ${error.message}`);
  }
}

// Run the script
main(); 