export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getApps } from 'firebase-admin/app';

export async function GET(request: NextRequest) {
  try {
    // Check for environment variables
    const envVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'not set',
      FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID ? 'set' : 'not set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'set (length: ' + 
        (process.env.FIREBASE_PRIVATE_KEY?.length || 0) + 
        ', starts with: ' + 
        (process.env.FIREBASE_PRIVATE_KEY?.substring(0, 10) || 'N/A') + 
        ')' : 'not set',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not set',
      FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID ? 'set' : 'not set',
      FIREBASE_CERT_URL: process.env.FIREBASE_CERT_URL ? 'set' : 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    // Check if Firebase Admin is initialized
    let adminInitialized = false;
    
    try {
      // Check if Firebase Admin is initialized
      const apps = getApps();
      adminInitialized = apps.length > 0;
      
      return NextResponse.json({
        success: true,
        environment: envVars,
        firebaseAdmin: {
          initialized: adminInitialized,
          appsCount: apps.length
        }
      });
    } catch (error: any) {
      console.error('Error checking Firebase Admin:', error);
      return NextResponse.json({
        success: false,
        environment: envVars,
        error: error.message,
        stack: error.stack
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in admin-sdk debug endpoint:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to debug admin SDK',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 