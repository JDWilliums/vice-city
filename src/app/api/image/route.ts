export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

// Debug flag
const DEBUG = true;

// Helper function to get project root directory that works in both development and production
const getProjectRoot = () => {
  // In Vercel, the code runs in /var/task
  if (process.env.VERCEL) {
    return process.cwd();
  }
  
  // In development, use process.cwd()
  return process.cwd();
};

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
        filename,
        cwd: process.cwd(),
        env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
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
      
      const projectRoot = getProjectRoot();
      
      // The full path to file we'll actually serve
      let fullImagePath = path.join(projectRoot, 'public', cleanImagePath);
      let fileFound = false;
      
      if (DEBUG) {
        console.log(`[Image API] Looking for image at: ${fullImagePath}`);
      }
      
      // If resolution is specified, look in the resolution folder with the same filename
      if (resolution) {
        if (DEBUG) console.log(`[Image API] Looking for image in resolution folder: ${resolution}`);
        
        // First look in the original directory structure with a resolution subdirectory
        // This structure is: /images/gallery/720p/image.png
        const originalDirWithResolution = path.join(baseDir, resolution, baseFilename);
        const fullOriginalDirWithResolutionPath = path.join(projectRoot, 'public', originalDirWithResolution);
        
        if (DEBUG) {
          console.log(`[Image API] Checking original directory with resolution path: ${fullOriginalDirWithResolutionPath}`);
          console.log(`[Image API] Path exists: ${fs.existsSync(fullOriginalDirWithResolutionPath)}`);
        }
        
        try {
          if (fs.existsSync(fullOriginalDirWithResolutionPath)) {
            fullImagePath = fullOriginalDirWithResolutionPath;
            fileFound = true;
            if (DEBUG) console.log(`[Image API] Found image in original directory with resolution subfolder: ${originalDirWithResolution}`);
          } else {
            // Second, try the top-level resolution directory 
            // This structure is: /720p/image.png
            const resolutionPath = path.join(resolution, baseFilename);
            const fullResolutionPath = path.join(projectRoot, 'public', resolutionPath);
            
            if (DEBUG) {
              console.log(`[Image API] Checking resolution root path: ${fullResolutionPath}`);
              console.log(`[Image API] Path exists: ${fs.existsSync(fullResolutionPath)}`);
            }
            
            if (fs.existsSync(fullResolutionPath)) {
              fullImagePath = fullResolutionPath;
              fileFound = true;
              if (DEBUG) console.log(`[Image API] Found image in resolution folder: ${resolutionPath}`);
            } else {
              if (DEBUG) console.log(`[Image API] Not found in any resolution location`);
            }
          }
        } catch (err: any) {
          console.error(`[Image API] Error checking resolution path: ${err}`);
        }
      }
      
      // If no resolution-specific image was found, use the original image
      if (!fileFound) {
        // Standard path = /images/image.png
        const originalPath = path.join(projectRoot, 'public', cleanImagePath);
        
        if (DEBUG) {
          console.log(`[Image API] Checking original path: ${originalPath}`);
          console.log(`[Image API] Path exists: ${fs.existsSync(originalPath)}`);
        }
        
        try {
          if (fs.existsSync(originalPath)) {
            fullImagePath = originalPath;
            fileFound = true;
            if (DEBUG) console.log(`[Image API] Using original image: ${cleanImagePath}`);
          } else {
            if (DEBUG) console.log(`[Image API] Image not found in any location: ${cleanImagePath}`);
            return NextResponse.json({ 
              error: 'Image not found',
              path: cleanImagePath,
              fullPath: originalPath,
              searched: [
                originalPath,
                resolution ? path.join(projectRoot, 'public', baseDir, resolution, baseFilename) : null,
                resolution ? path.join(projectRoot, 'public', resolution, baseFilename) : null,
              ].filter(Boolean)
            }, { status: 404 });
          }
        } catch (err: any) {
          console.error(`[Image API] Error checking original path: ${err}`);
          return NextResponse.json({ 
            error: 'Error accessing file',
            message: err.message,
            path: cleanImagePath
          }, { status: 500 });
        }
      }
      
      // Get the file stats for size information and headers
      let fileStats;
      try {
        fileStats = await stat(fullImagePath);
      } catch (err: any) {
        console.error(`[Image API] Error getting file stats: ${err}`);
        return NextResponse.json({ 
          error: 'Error reading file stats',
          message: err.message,
          path: fullImagePath
        }, { status: 500 });
      }
      
      // Log file details for debugging
      if (DEBUG) {
        console.log(`[Image API] Serving file from: ${fullImagePath}`);
        console.log(`[Image API] File size: ${(fileStats.size / 1024).toFixed(2)}KB`);
      }
      
      // Prepare headers for response
      const headers = new Headers();
      
      // Set content type
      const contentTypeExt = fileExt.substring(1).toLowerCase();
      headers.set('Content-Type', `image/${contentTypeExt === 'jpg' ? 'jpeg' : contentTypeExt}`);
      
      // Set download headers if requested
      if (download) {
        headers.set('Content-Disposition', `attachment; filename="${filename}${fileExt}"`);
        if (DEBUG) console.log(`[Image API] Serving as download: ${filename}${fileExt}`);
      }
      
      // Set caching headers
      headers.set('Cache-Control', 'public, max-age=31536000');
      headers.set('Content-Length', fileStats.size.toString());
      
      try {
        // Create a ReadableStream from the file
        const stream = createReadStream(fullImagePath);
        
        // Create a new Response with the stream
        return new Response(stream as any, {
          headers,
          status: 200,
        });
      } catch (err: any) {
        console.error(`[Image API] Error creating stream: ${err}`);
        return NextResponse.json({ 
          error: 'Error streaming file',
          message: err.message 
        }, { status: 500 });
      }
    } catch (error: any) {
      console.error(`[Image API] Error serving image:`, error);
      return NextResponse.json(
        { error: 'Error serving image', message: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in image API:', error);
    return NextResponse.json(
      { error: 'Error processing request', message: error.message },
      { status: 500 }
    );
  }
} 