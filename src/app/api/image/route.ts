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
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const quality = searchParams.get('quality') || '80';
    const format = searchParams.get('format') || 'webp';
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
        width,
        height,
        quality,
        format,
        download,
        filename
      });
    }

    // Clean the image path (remove leading slash if present)
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // Check if the file exists in the public directory
    const fullImagePath = path.join(process.cwd(), 'public', cleanImagePath);
    if (!fs.existsSync(fullImagePath)) {
      if (DEBUG) console.log(`[Image API] File not found: ${fullImagePath}`);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (DEBUG) console.log(`[Image API] File found: ${fullImagePath}`);

    // For direct file serving (only when no resizing is requested)
    if (!width && !height) {
      if (DEBUG) console.log(`[Image API] Direct file serving (no resize parameters provided)`);
      try {
        const fileBuffer = fs.readFileSync(fullImagePath);
        const fileExt = path.extname(fullImagePath).substring(1).toLowerCase();
        
        const response = new NextResponse(fileBuffer);
        response.headers.set('Content-Type', `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`);
        
        if (download) {
          const downloadFilename = `${filename || path.basename(fullImagePath, path.extname(fullImagePath))}.${fileExt}`;
          response.headers.set('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        }
        
        response.headers.set('Cache-Control', 'public, max-age=31536000');
        
        return response;
      } catch (err) {
        if (DEBUG) console.error(`[Image API] Error serving file directly:`, err);
        return NextResponse.json(
          { error: 'Error serving file' },
          { status: 500 }
        );
      }
    }

    // For image optimization using Next.js image optimizer
    try {
      // Construct the URL for Next.js image optimizer
      const baseUrl = request.nextUrl.origin;
      
      // CRITICAL: Format URL exactly as Next.js expects it - this is path from public directory
      // Use simple, non-encoded path format - Next.js will handle encoding internally
      const nextImageUrl = new URL(`${baseUrl}/_next/image`);
      
      // Important: We must NOT double-encode the URL and use the proper format
      nextImageUrl.searchParams.set('url', imagePath);
      nextImageUrl.searchParams.set('w', width || '1920');
      nextImageUrl.searchParams.set('q', quality);
      
      if (height) {
        nextImageUrl.searchParams.set('h', height);
      }

      if (DEBUG) {
        console.log(`[Image API] Next.js Image URL: ${nextImageUrl.toString()}`);
        console.log(`[Image API] Requested format: ${format}, dimensions: ${width}x${height}`);
      }
      
      // Fetch the optimized image from Next.js
      const imageResponse = await fetch(nextImageUrl.toString(), {
        headers: {
          'Host': request.headers.get('host') || 'localhost'
        }
      });
      
      if (!imageResponse.ok) {
        if (DEBUG) {
          console.error(`[Image API] Failed to fetch from Next.js Image Optimizer:`, {
            status: imageResponse.status,
            statusText: imageResponse.statusText,
            imageUrl: nextImageUrl.toString()
          });
          const text = await imageResponse.text();
          console.error(`Response body:`, text);
        }
        
        // Fallback to direct file serving
        if (DEBUG) console.log(`[Image API] Falling back to direct file serving`);
        const fileBuffer = fs.readFileSync(fullImagePath);
        const fileExt = path.extname(fullImagePath).substring(1).toLowerCase();
        
        const response = new NextResponse(fileBuffer);
        response.headers.set('Content-Type', `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`);
        
        if (download) {
          // If a specific format was requested, use that for the filename extension
          const downloadExt = format || fileExt;
          response.headers.set('Content-Disposition', `attachment; filename="${filename}.${downloadExt}"`);
          if (DEBUG) console.log(`[Image API] Serving original file as ${filename}.${downloadExt}`);
        }
        
        response.headers.set('Cache-Control', 'public, max-age=31536000');
        
        return response;
      }
      
      // Get the optimized image as array buffer
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Log the size of the optimized image
      if (DEBUG) {
        const size = Math.round((imageBuffer.byteLength / 1024) * 100) / 100;
        console.log(`[Image API] Next.js optimizer result - size: ${size}KB, format: ${format}`);
      }
      
      // Create response with the optimized image
      const response = new NextResponse(imageBuffer);
      
      // Set appropriate headers for download
      // Note: Next.js will convert to WebP by default, unless we tell it not to
      // For PNG downloads, we need to ensure the content type is set correctly
      let contentType = imageResponse.headers.get('content-type');
      
      // If we requested PNG but got WebP, we should note this in logs
      if (format === 'png' && contentType?.includes('webp')) {
        if (DEBUG) console.log(`[Image API] Warning: Requested PNG but Next.js returned WebP`);
      }
      
      // Force the content type if necessary for specific formats
      if (format === 'png') {
        contentType = 'image/png';
      } else if (format === 'jpg') {
        contentType = 'image/jpeg';
      }
      
      response.headers.set('Content-Type', contentType || `image/${format === 'jpg' ? 'jpeg' : format}`);
      
      if (download) {
        response.headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`);
        if (DEBUG) console.log(`[Image API] Serving optimized file as ${filename}.${format}`);
      }
      
      response.headers.set('Cache-Control', 'public, max-age=31536000');
      
      return response;
    } catch (error) {
      if (DEBUG) console.error(`[Image API] Error optimizing image:`, error);
      
      // Fallback to direct file serving as last resort
      try {
        if (DEBUG) console.log(`[Image API] Falling back to direct file serving after error`);
        const fileBuffer = fs.readFileSync(fullImagePath);
        const fileExt = path.extname(fullImagePath).substring(1).toLowerCase();
        
        const response = new NextResponse(fileBuffer);
        response.headers.set('Content-Type', `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`);
        
        if (download) {
          // Default to the requested format for the extension if we have one
          const downloadExt = format || fileExt;
          response.headers.set('Content-Disposition', `attachment; filename="${filename}.${downloadExt}"`);
          if (DEBUG) console.log(`[Image API] Serving original file after error as ${filename}.${downloadExt}`);
        }
        
        response.headers.set('Cache-Control', 'public, max-age=31536000');
        
        return response;
      } catch (err) {
        if (DEBUG) console.error(`[Image API] Error in fallback:`, err);
        return NextResponse.json(
          { error: 'Error processing image' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in image API:', error);
    return NextResponse.json(
      { error: 'Error processing image' },
      { status: 500 }
    );
  }
} 