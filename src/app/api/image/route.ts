export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';

// Simple cache with TTL
const imageCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get('path');
    const download = searchParams.get('download') === 'true';
    const filename = searchParams.get('filename') || 'image';

    // Validate parameters
    if (!imagePath) {
      return NextResponse.json(
        { error: 'Missing image path' },
        { status: 400 }
      );
    }

    // Clean the image path
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullImagePath = path.join(process.cwd(), 'public', cleanImagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullImagePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // For image resizing, we'll redirect to Next.js's built-in image optimization
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const format = searchParams.get('format') || getImageFormat(fullImagePath);
    
    if (width || height) {
      // Use Next.js Image Optimization by redirecting to /_next/image
      const optimizedImageUrl = `/_next/image?url=${encodeURIComponent(imagePath)}&w=${width || 'auto'}&q=75${height ? `&h=${height}` : ''}`;
      
      if (download) {
        // For downloads we still need to serve directly
        // Fetch the optimized image
        const optimizedImage = await fetch(new URL(optimizedImageUrl, request.url));
        const imageBuffer = await optimizedImage.arrayBuffer();
        
        // Create response
        const response = new NextResponse(imageBuffer);
        
        // Set headers
        response.headers.set('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
        response.headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`);
        response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        return response;
      } else {
        // For display, redirect to Next.js image optimization
        return NextResponse.redirect(new URL(optimizedImageUrl, request.url));
      }
    }

    // For direct serving without resizing
    const fileStats = fs.statSync(fullImagePath);
    const fileSize = fileStats.size;
    
    // Create response
    const response = new NextResponse(createReadStream(fullImagePath) as any);
    
    // Set appropriate headers
    response.headers.set('Content-Type', `image/${format}`);
    response.headers.set('Content-Length', fileSize.toString());
    response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    if (download) {
      response.headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`);
    }
    
    return response;
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Error processing image' },
      { status: 500 }
    );
  }
}

// Helper to determine image format from file extension
function getImageFormat(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().substring(1);
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
    return ext === 'jpg' ? 'jpeg' : ext;
  }
  return 'jpeg'; // Default
} 