export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Debug flag
const DEBUG = true;

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get('path');
    const resolution = searchParams.get('resolution');
    const download = searchParams.get('download') === 'true';
    const filename = searchParams.get('filename') || 'image';

    // Validate parameters
    if (!imagePath) {
      return NextResponse.json(
        { error: 'Missing image path' },
        { status: 400 }
      );
    }

    if (DEBUG) {
      console.log(`[Image API] Parameters:`, {
        imagePath,
        resolution,
        download,
        filename
      });
    }

    // Clean the image path (remove leading slash if present)
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    try {
      // Extract the base filename and directory
      const baseFilename = path.basename(cleanImagePath);
      const baseDir = path.dirname(cleanImagePath);
      const fileExt = path.extname(baseFilename);
      const filenameWithoutExt = path.basename(baseFilename, fileExt);
      
      // The full path to file we'll actually serve
      let fullImagePath = path.join(process.cwd(), 'public', cleanImagePath);
      let fileFound = false;
      
      // If resolution is specified, look in the resolution folder
      if (resolution) {
        if (DEBUG) console.log(`[Image API] Looking for image in resolution folder: ${resolution}`);
        
        // First priority: Check for a file with the resolution in the name in the resolution folder
        // e.g., /720p/imagename-720p.png
        const resolutionFilename = `${filenameWithoutExt}-${resolution}${fileExt}`;
        const resolutionNamePath = path.join(resolution, resolutionFilename);
        const fullResolutionNamePath = path.join(process.cwd(), 'public', resolutionNamePath);
        
        if (fs.existsSync(fullResolutionNamePath)) {
          fullImagePath = fullResolutionNamePath;
          fileFound = true;
          if (DEBUG) console.log(`[Image API] Found in resolution folder with resolution suffix: ${resolutionNamePath}`);
        } else {
          if (DEBUG) console.log(`[Image API] Not found with resolution in name: ${resolutionNamePath}`);
          
          // Second try: direct path in the resolution folder
          // e.g., /720p/imagename.png (keeping the same filename)
          const resolutionPath = path.join(resolution, baseFilename);
          const fullResolutionPath = path.join(process.cwd(), 'public', resolutionPath);
          
          if (fs.existsSync(fullResolutionPath)) {
            fullImagePath = fullResolutionPath;
            fileFound = true;
            if (DEBUG) console.log(`[Image API] Found image in resolution folder: ${resolutionPath}`);
          } else {
            if (DEBUG) console.log(`[Image API] Not found in resolution folder with same name: ${resolutionPath}`);
          }
        }
      }
      
      // If no resolution-specific image was found, check if the original image exists
      if (!fileFound) {
        // Standard path = /images/image.png
        const originalPath = path.join(process.cwd(), 'public', cleanImagePath);
        if (fs.existsSync(originalPath)) {
          fullImagePath = originalPath;
          fileFound = true;
          if (DEBUG) console.log(`[Image API] Using original image: ${cleanImagePath}`);
        } else {
          // Last attempt: Try with resolution suffix in the images folder
          // e.g., /images/imagename-720p.png
          const fallbackPath = path.join(baseDir, `${filenameWithoutExt}-${resolution}${fileExt}`);
          const fullFallbackPath = path.join(process.cwd(), 'public', fallbackPath);
          
          if (fs.existsSync(fullFallbackPath)) {
            fullImagePath = fullFallbackPath;
            fileFound = true;
            if (DEBUG) console.log(`[Image API] Found original image with resolution suffix: ${fallbackPath}`);
          } else {
            if (DEBUG) console.log(`[Image API] Image not found in any location: ${cleanImagePath}`);
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
          }
        }
      }
      
      // Read the image file directly from the found path
      const fileBuffer = fs.readFileSync(fullImagePath);
      
      // Get the file stats for size information
      const fileStats = fs.statSync(fullImagePath);
      
      // Log file details for debugging
      if (DEBUG) {
        console.log(`[Image API] Serving file from: ${fullImagePath}`);
        console.log(`[Image API] File size: ${(fileStats.size / 1024).toFixed(2)}KB`);
      }
      
      // Prepare the response
      const response = new NextResponse(fileBuffer);
      
      // Set content type
      const contentTypeExt = fileExt.substring(1).toLowerCase();
      response.headers.set('Content-Type', `image/${contentTypeExt === 'jpg' ? 'jpeg' : contentTypeExt}`);
      
      // Set download headers if requested
      if (download) {
        response.headers.set('Content-Disposition', `attachment; filename="${filename}${fileExt}"`);
        if (DEBUG) console.log(`[Image API] Serving as download: ${filename}${fileExt}`);
      }
      
      // Set caching headers
      response.headers.set('Cache-Control', 'public, max-age=31536000');
      
      return response;
    } catch (error) {
      console.error(`[Image API] Error serving image:`, error);
      return NextResponse.json(
        { error: 'Error serving image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in image API:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
} 