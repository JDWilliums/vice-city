export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🔍 DIRECT ADMIN CHECK API called');
  
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'No session found' 
      }, { status: 401 });
    }
    
    console.log('✅ Session cookie found, length:', sessionCookie.length);
    
    // Import the admin SDK at runtime
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    
    // Get the admin auth and db instances
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    console.log('✅ Got Admin SDK instances');
    
    // Verify the session
    console.log('🔑 Verifying token...');
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified for UID:', uid);
    
    // DIRECT CHECK using admin SDK - bypassing userService
    console.log('🔍 Directly checking admin status in Firestore...');
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return NextResponse.json({ 
        isAdmin: false, 
        uid,
        verified: true, 
        error: 'User document not found',
        userDocExists: false
      });
    }
    
    // Get the user data
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    
    console.log('📊 Admin status directly from Firestore:', isAdmin);
    
    return NextResponse.json({
      isAdmin,
      uid,
      verified: true,
      userDocExists: true,
      docData: {
        isAdmin: userData?.isAdmin,
        email: userData?.email,
        displayName: userData?.displayName
      }
    });
  } catch (error: any) {
    console.error('❌ Error in direct-check API:', error);
    
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Failed to check admin status',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 