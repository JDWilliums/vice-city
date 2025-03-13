import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

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
    
    try {
      // Verify the token is valid
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      if (decodedToken.uid !== uid) {
        console.error('Token UID mismatch:', { tokenUid: decodedToken.uid, requestUid: uid });
        return NextResponse.json({ success: false, error: 'Token UID mismatch' }, { status: 403 });
      }
      
      // Calculate expiry (1 hour from now)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      
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
      
      return NextResponse.json({ 
        success: true, 
        message: 'Session cookie set successfully',
        expires: expiryDate.toISOString()
      });
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: tokenError?.message
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