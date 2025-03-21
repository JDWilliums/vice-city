import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dynamically import Firebase Admin to prevent build-time initialization
let adminAuth: any;
let adminDb: any;

// This initialization will only happen at runtime, not build time
async function initAdminSDK() {
  if (!adminAuth || !adminDb) {
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    adminAuth = getAdminAuth();
    adminDb = getAdminDb();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session found' 
      }, { status: 401 });
    }
    
    // Initialize the admin SDK at runtime
    await initAdminSDK();
    
    // Verify the token to get the UID
    let uid: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      uid = decodedToken.uid;
      console.log('Making user admin:', uid);
    } catch (tokenError: any) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid session token',
        errorDetails: tokenError?.message || 'Unknown error' 
      }, { status: 401 });
    }
    
    // Update the user's admin status in Firestore
    try {
      await adminDb.collection('users').doc(uid).update({
        isAdmin: true,
        lastUpdated: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: `User ${uid} is now an admin`
      });
    } catch (firestoreError: any) {
      return NextResponse.json({ 
        success: false,
        error: 'Error updating user in Firestore',
        errorDetails: firestoreError?.message || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error making user admin:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to make user admin',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 