#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if sharp is installed
if ! npm list sharp > /dev/null 2>&1; then
  echo "Installing sharp..."
  npm install --save sharp
fi

# Check if unprocessed-images directory exists
if [ ! -d "public/unprocessed-images" ]; then
  echo "Creating unprocessed-images directory..."
  mkdir -p public/unprocessed-images
  echo "Please place your images in the unprocessed-images folder, then run this script again."
  exit 0
fi

# Count images in the unprocessed directory
image_count=$(find public/unprocessed-images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | wc -l)

if [ "$image_count" -eq 0 ]; then
  echo "No images found in public/unprocessed-images"
  echo "Please place your images in the unprocessed-images folder, then run this script again."
  exit 0
fi

# Run the generation script
echo "Starting image generation for $image_count images..."
npm run generate-images

echo "Done!" 