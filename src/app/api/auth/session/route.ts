export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const { idToken, uid } = await request.json();
    
    if (!idToken || !uid) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Received token API request for user:', uid);
    console.log('Token preview:', 
      idToken.substring(0, 10) + '...' + idToken.substring(idToken.length - 10));
    console.log('Token length:', idToken.length);
    
    // Validate token structure
    if (!idToken.startsWith('ey') || !idToken.includes('.')) {
      console.error('Invalid token format received');
      return NextResponse.json({
        success: false,
        error: 'Invalid token format',
        message: 'The provided token does not appear to be a valid JWT'
      }, { status: 400 });
    }
    
    try {
      // Import and initialize Firebase Admin at runtime
      const { getAdminAuth } = await import('@/lib/firebase-admin');
      const adminAuth = getAdminAuth();
      
      console.log('Firebase Admin Auth initialized successfully');
      
      // Verify the token is valid
      console.log('Verifying token...');
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('Token verified successfully for UID:', decodedToken.uid);
      
      if (decodedToken.uid !== uid) {
        console.error('Token UID mismatch:', { tokenUid: decodedToken.uid, requestUid: uid });
        return NextResponse.json({ success: false, error: 'Token UID mismatch' }, { status: 403 });
      }
      
      // Calculate expiry (1 hour from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      
      // Check if there's already a session cookie
      const existingCookie = cookies().get('session');
      if (existingCookie) {
        console.log('Existing session cookie found:', 
          existingCookie.value.substring(0, 10) + '...' + 
          existingCookie.value.substring(existingCookie.value.length - 10));
      }
      
      // Set the cookie using server-side approach
      cookies().set({
        name: 'session',
        value: idToken,
        expires: expiryDate,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Verify the cookie was set
      const newCookie = cookies().get('session');
      if (!newCookie) {
        console.warn('Cookie appears not to have been set properly');
      } else {
        console.log('Cookie set successfully with expiry:', expiryDate.toISOString());
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Session cookie set successfully',
        expires: expiryDate.toISOString()
      });
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError);
      
      // Log initialization status for debugging
      try {
        const { getFirebaseAdminInitStatus } = await import('@/lib/firebase-admin');
        const initStatus = getFirebaseAdminInitStatus();
        console.error('Firebase Admin SDK status:', {
          isInitialized: initStatus.isInitialized,
          hasError: initStatus.hasError,
          errorMessage: initStatus.errorMessage
        });
      } catch (statusError) {
        console.error('Error getting Firebase Admin status:', statusError);
      }
      
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: tokenError?.message || 'Unknown error'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error setting session cookie:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 