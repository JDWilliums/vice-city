import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dynamically import Firebase Admin to prevent build-time initialization
let adminAuth: any;

// This initialization will only happen at runtime, not build time
async function initAdminSDK() {
  if (!adminAuth) {
    const { getAdminAuth } = await import('@/lib/firebase-admin');
    adminAuth = getAdminAuth();
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Token debug API called');
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('No session cookie found');
      return NextResponse.json({ 
        verified: false, 
        error: 'No session cookie found',
        cookiesFound: cookies().getAll().map(c => c.name)
      }, { status: 401 });
    }
    
    console.log('Session cookie found, length:', sessionCookie.length);
    
    try {
      // Initialize the admin SDK at runtime
      await initAdminSDK();
      
      // Try to verify the token
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      
      // Success!
      return NextResponse.json({
        verified: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        tokenDetails: {
          issuer: decodedToken.iss,
          subject: decodedToken.sub,
          audience: decodedToken.aud,
          expirationTime: new Date(decodedToken.exp * 1000).toISOString(),
          issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
        }
      });
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError);
      
      return NextResponse.json({
        verified: false,
        error: tokenError?.message || 'Unknown token verification error',
        tokenPreview: sessionCookie.length > 20 
          ? `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`
          : 'Token too short'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error in token debug endpoint:', error);
    return NextResponse.json({
      verified: false,
      error: 'Server error',
      details: error?.message || 'Unknown error',
    }, { status: 500 });
  }
} 