export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get('path');
    const width = parseInt(searchParams.get('width') || '0', 10);
    const height = parseInt(searchParams.get('height') || '0', 10);
    const format = searchParams.get('format') || 'png';
    const download = searchParams.get('download') === 'true';
    const filename = searchParams.get('filename') || 'image';

    // Validate parameters
    if (!imagePath || (!width && !height)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Determine the absolute path to the image
    // Remove leading slash if present
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullImagePath = path.join(process.cwd(), 'public', cleanImagePath);

    // Check if file exists
    if (!fs.existsSync(fullImagePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Read the image
    const imageBuffer = fs.readFileSync(fullImagePath);

    // Process the image with Sharp
    let image = sharp(imageBuffer);
    
    // Resize
    if (width && height) {
      image = image.resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    } else if (width) {
      image = image.resize(width, null);
    } else if (height) {
      image = image.resize(null, height);
    }
    
    // Convert to requested format
    if (format === 'jpeg' || format === 'jpg') {
      image = image.jpeg({ quality: 85 });
    } else if (format === 'webp') {
      image = image.webp({ quality: 85 });
    } else {
      // Default to PNG
      image = image.png({ compressionLevel: 9 });
    }
    
    // Get the processed image as buffer
    const processedImage = await image.toBuffer();
    
    // Create response
    const response = new NextResponse(processedImage);
    
    // Set appropriate headers
    response.headers.set('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
    
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