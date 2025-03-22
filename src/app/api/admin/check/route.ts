export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('📣 Admin check API called');
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return NextResponse.json({ isAdmin: false, error: 'No session found' }, { status: 401 });
    }
    
    console.log('✅ Session cookie found, length:', sessionCookie.length);
    
    try {
      // Import the necessary functions at runtime
      const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
      
      // Get the admin auth instance
      const adminAuth = getAdminAuth();
      console.log('✅ Successfully got Admin Auth instance');
      
      // Add token debug info
      const tokenPreview = sessionCookie.length > 20 
        ? `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`
        : sessionCookie;
      console.log(`Token preview: ${tokenPreview}, length: ${sessionCookie.length}`);
      
      // Verify the session
      console.log('🔑 Verifying token...');
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      const uid = decodedToken.uid;
      
      console.log('✅ Token verified successfully for UID:', uid);
      
      // Get Admin DB instance
      const adminDb = getAdminDb();
      
      // Check if user is admin in Firestore
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log('❌ User document not found in Firestore');
        return NextResponse.json({ isAdmin: false });
      }
      
      const userData = userDoc.data();
      const isAdmin = userData?.isAdmin === true;
      
      console.log('📊 Admin status from Firestore:', isAdmin ? 'TRUE' : 'FALSE');
      
      // If user is admin, set the admin-session cookie
      if (isAdmin) {
        console.log('🔑 Setting admin-session cookie for admin user');
        
        // Calculate expiry (1 hour from now)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        
        // Set admin-session cookie
        cookies().set({
          name: 'admin-session',
          value: 'true',
          expires: expiryDate,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        // Also refresh the regular session cookie to keep expiration times in sync
        cookies().set({
          name: 'session',
          value: sessionCookie,
          expires: expiryDate,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        console.log('✅ Admin session cookie set, expires:', expiryDate.toISOString());
      }
      
      // Return the result
      return NextResponse.json({ 
        isAdmin, 
        uid,
        hasCookie: !!cookies().get('admin-session')
      });
    } catch (tokenError: any) {
      console.error('❌ Token verification failed:', tokenError);
      return NextResponse.json({
        isAdmin: false,
        error: 'Invalid token',
        message: tokenError?.message || 'Unknown error'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('❌ Admin check API error:', error);
    return NextResponse.json({
      isAdmin: false,
      error: 'Server error',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 