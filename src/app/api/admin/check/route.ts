import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { isUserAdmin } from '@/lib/userService';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin check API called');
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('No session cookie found');
      return NextResponse.json({ isAdmin: false, error: 'No session found' }, { status: 401 });
    }
    
    console.log('Session cookie found, verifying token');
    
    try {
      // Verify the session
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      const uid = decodedToken.uid;
      
      console.log('Token verified successfully for UID:', uid);
      
      // Check if user is admin
      const adminStatus = await isUserAdmin(uid);
      console.log('Admin status for user:', adminStatus);
      
      return NextResponse.json({ 
        isAdmin: adminStatus,
        uid: uid,
        verified: true
      });
    } catch (tokenError: any) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Invalid session token',
        errorDetails: tokenError?.message || 'Unknown error'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Failed to verify admin status',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 