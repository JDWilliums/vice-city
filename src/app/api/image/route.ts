export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp'; // Import Sharp for manual resizing

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

    // Try manual resizing with Sharp first (more reliable for downloads)
    try {
      if (DEBUG) console.log(`[Image API] Attempting manual resize with Sharp`);
      
      const widthInt = width ? parseInt(width) : null;
      const heightInt = height ? parseInt(height) : null;
      
      if (widthInt || heightInt) {
        const fileBuffer = fs.readFileSync(fullImagePath);
        let sharpInstance = sharp(fileBuffer);
        
        // Resize image
        sharpInstance = sharpInstance.resize({
          width: widthInt || undefined,
          height: heightInt || undefined,
          fit: 'inside',
          withoutEnlargement: true
        });
        
        // Set format
        if (format === 'png') {
          sharpInstance = sharpInstance.png({ quality: parseInt(quality) });
        } else if (format === 'jpg' || format === 'jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
        } else {
          sharpInstance = sharpInstance.webp({ quality: parseInt(quality) });
        }
        
        // Get buffer
        const resizedBuffer = await sharpInstance.toBuffer();
        
        // Check metadata to verify resizing worked
        const metadata = await sharp(resizedBuffer).metadata();
        if (DEBUG) console.log(`[Image API] Sharp resize result:`, {
          requestedWidth: widthInt,
          requestedHeight: heightInt,
          actualWidth: metadata.width,
          actualHeight: metadata.height,
          format: metadata.format,
          size: resizedBuffer.length / 1024 + 'KB'
        });
        
        // Create response
        const response = new NextResponse(resizedBuffer);
        response.headers.set('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
        
        if (download) {
          response.headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`);
        }
        
        response.headers.set('Cache-Control', 'public, max-age=31536000');
        
        return response;
      }
    } catch (sharpError) {
      if (DEBUG) console.error(`[Image API] Sharp resize error, falling back to Next.js:`, sharpError);
    }

    // For image optimization using Next.js image optimizer (fallback)
    try {
      // Construct optimizer URL (ensuring it's absolute to work internally)
      const baseUrl = request.nextUrl.origin;
      const encodedImagePath = encodeURIComponent(imagePath.startsWith('/') ? imagePath : `/${imagePath}`);
      const nextImageUrl = new URL(`${baseUrl}/_next/image`);
      
      // Add the image URL parameter (using the URL format expected by Next.js)
      nextImageUrl.searchParams.set('url', encodedImagePath);
      
      // Set required parameters
      nextImageUrl.searchParams.set('w', width || '1920');
      nextImageUrl.searchParams.set('q', quality);
      
      // Set optional parameters
      if (height) {
        nextImageUrl.searchParams.set('h', height);
      }

      if (DEBUG) console.log(`[Image API] Next.js Image URL: ${nextImageUrl.toString()}`);
      
      // Fetch the optimized image from Next.js
      const imageResponse = await fetch(nextImageUrl.toString(), {
        headers: {
          // Add host header to ensure request works internally
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
          response.headers.set('Content-Disposition', `attachment; filename="${filename}.${fileExt}"`);
        }
        
        response.headers.set('Cache-Control', 'public, max-age=31536000');
        
        return response;
      }
      
      // Get the optimized image as array buffer
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // Verify the image was actually resized by Next.js
      try {
        const buffer = Buffer.from(imageBuffer);
        const metadata = await sharp(buffer).metadata();
        if (DEBUG) console.log(`[Image API] Next.js optimizer result:`, {
          requestedWidth: parseInt(width || '0'),
          requestedHeight: height ? parseInt(height) : null,
          actualWidth: metadata.width,
          actualHeight: metadata.height,
          format: metadata.format,
          size: buffer.length / 1024 + 'KB'
        });
      } catch (error) {
        if (DEBUG) console.error(`[Image API] Error checking image metadata:`, error);
      }
      
      // Create response with the optimized image
      const response = new NextResponse(imageBuffer);
      
      // Set appropriate headers for download
      const contentType = imageResponse.headers.get('content-type') || `image/${format === 'jpg' ? 'jpeg' : format}`;
      response.headers.set('Content-Type', contentType);
      
      if (download) {
        response.headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`);
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
          response.headers.set('Content-Disposition', `attachment; filename="${filename}.${fileExt}"`);
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