import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'set' : 'not set',
    FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID ? 'set' : 'not set',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 
      `set (length: ${process.env.FIREBASE_PRIVATE_KEY.length}, starts with: ${process.env.FIREBASE_PRIVATE_KEY.substring(0, 10)}...)` : 
      'not set',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not set',
    FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID ? 'set' : 'not set',
    FIREBASE_CERT_URL: process.env.FIREBASE_CERT_URL ? 'set' : 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set'
  };
  
  return NextResponse.json({ env: envVars });
} 