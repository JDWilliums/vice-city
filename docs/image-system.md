# Resolution-Based Image System

This document describes the resolution-based image system used in this application.

## Overview

Instead of dynamically resizing images at runtime, this application uses pre-generated images stored in resolution-specific folders. This approach:

1. Reduces serverless function size
2. Improves performance by eliminating on-the-fly processing
3. Ensures consistent quality across all images

## How It Works

### Directory Structure

Images are stored in resolution-specific folders:

```
public/
  ├── images/         # Original images (fallback)
  ├── 720p/           # 720p resolution images (1280×720)
  ├── 1080p/          # 1080p resolution images (1920×1080)
  ├── 1440p/          # 1440p resolution images (2560×1440)
  ├── 4k/             # 4K resolution images (3840×2160)
  ├── iphone/         # iPhone resolution images (828×1792)
  ├── android/        # Android resolution images (1080×2340)
  ├── ipad/           # iPad resolution images (2048×2732)
  ├── thumb/          # Thumbnails (200×150)
  └── unprocessed-images/  # Drop folder for images to be processed
```

### Available Resolutions

The following pre-defined resolutions are supported:

| ID | Dimensions | Description |
|----|------------|-------------|
| 720p | 1280×720 | HD |
| 1080p | 1920×1080 | Full HD |
| 1440p | 2560×1440 | QHD |
| 4k | 3840×2160 | 4K UHD |
| iphone | 828×1792 | iPhone |
| android | 1080×2340 | Android |
| ipad | 2048×2732 | iPad |
| thumb | 200×150 | Thumbnail |

### Image Processing Workflow

1. Place original images in the `public/unprocessed-images` folder
2. Run the processing script (`npm run generate-images` or use the provided shell scripts)
3. The script creates all required resolution versions in their respective folders
4. The original images are copied to the `public/images` folder for fallback
5. The images in the `unprocessed-images` folder are deleted once processed

### API

The image API serves these pre-sized images from the appropriate resolution folder:

```
/api/image?path=/images/photo.jpg&resolution=1080p
```

Parameters:
- `path`: Path to the original image (required)
- `resolution`: Resolution ID (optional, falls back to original if not provided)
- `download`: Set to 'true' to force download (optional)
- `filename`: Custom filename for download (optional)

### Generating Pre-sized Images

Three methods are provided to generate images:

1. **NPM Script**: 
   ```bash
   npm run generate-images
   ```

2. **PowerShell Script** (Windows):
   ```
   scripts/generate-images.ps1
   ```

3. **Bash Script** (Linux/macOS):
   ```bash
   scripts/generate-images.sh
   ```

The script:
1. Checks for images in the `public/unprocessed-images` folder
2. Creates resolution-specific folders if they don't exist
3. Processes each image to create versions for all resolutions
4. Preserves aspect ratio while resizing
5. Saves a copy of the original in the `public/images` folder
6. Deletes the original from the `unprocessed-images` folder once processed

## Utilities

The `src/utils/imageProcessing.ts` file provides utilities for working with the resolution-based images:

- `getImageUrl`: Generate URLs for accessing specific resolutions
- `getPlaceholderUrl`: Get the URL for a thumbnail version
- `formatImageFilename`: Format filenames for downloads

## Deployment Considerations

1. Make sure to run the image generation script before deployment
2. This approach significantly reduces serverless function size
3. The API only needs to serve static files, not process images 