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
      // Extract the base path and filename
      const basePath = path.dirname(cleanImagePath);
      const baseFilename = path.basename(cleanImagePath);
      let targetPath = cleanImagePath;
      
      // If resolution is specified, look for the image in the appropriate resolution folder
      if (resolution) {
        // First, check if the resolution-specific image exists
        // Format: /720p/images/filename.jpg or /images/720p/filename.jpg
        const resolutionPaths = [
          path.join(basePath, resolution, baseFilename), // e.g., images/720p/photo.jpg
          path.join(resolution, basePath, baseFilename), // e.g., 720p/images/photo.jpg
          path.join(resolution, baseFilename), // e.g., 720p/photo.jpg
        ];
        
        // Try each possible path
        for (const resPath of resolutionPaths) {
          const fullResPath = path.join(process.cwd(), 'public', resPath);
          if (fs.existsSync(fullResPath)) {
            targetPath = resPath;
            if (DEBUG) console.log(`[Image API] Found in resolution folder: ${targetPath}`);
            break;
          }
        }
      }
      
      // Check if the target file exists
      const fullImagePath = path.join(process.cwd(), 'public', targetPath);
      if (!fs.existsSync(fullImagePath)) {
        if (DEBUG) console.log(`[Image API] File not found: ${fullImagePath}`);
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      
      if (DEBUG) console.log(`[Image API] Serving file: ${targetPath}`);
      
      // Read the file
      const fileBuffer = fs.readFileSync(fullImagePath);
      const fileExt = path.extname(fullImagePath).substring(1).toLowerCase();
      
      // Prepare the response
      const response = new NextResponse(fileBuffer);
      
      // Set the content type based on the file extension
      response.headers.set('Content-Type', `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`);
      
      // Set download headers if requested
      if (download) {
        // Use the provided filename or fallback to the original filename
        const downloadFilename = filename || path.basename(targetPath);
        response.headers.set('Content-Disposition', `attachment; filename="${downloadFilename}.${fileExt}"`);
        if (DEBUG) console.log(`[Image API] Serving as download: ${downloadFilename}.${fileExt}`);
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