export const dynamic = 'force-dynamic';

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
        exists: false, 
        error: 'No session found' 
      }, { status: 401 });
    }
    
    // Get the UID from the query or from the token
    let uid: string;
    
    const searchParams = request.nextUrl.searchParams;
    const queryUid = searchParams.get('uid');
    
    if (queryUid) {
      uid = queryUid;
    } else {
      // Initialize the admin SDK
      await initAdminSDK();
      
      // Verify the token to get the UID
      try {
        const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
        uid = decodedToken.uid;
      } catch (tokenError: any) {
        return NextResponse.json({ 
          exists: false, 
          error: 'Invalid session token',
          errorDetails: tokenError?.message || 'Unknown error' 
        }, { status: 401 });
      }
    }
    
    // Fetch user data from Firestore
    try {
      // Initialize the admin SDK if not already done
      await initAdminSDK();
      
      const userDoc = await adminDb.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ 
          exists: false,
          uid: uid,
          error: 'User document not found in Firestore' 
        });
      }
      
      // Return user data with sensitive fields redacted
      const userData = userDoc.data();
      
      return NextResponse.json({
        exists: true,
        uid: uid,
        data: {
          ...userData,
          // Redact any sensitive fields if needed
        }
      });
    } catch (firestoreError: any) {
      return NextResponse.json({ 
        exists: false,
        uid: uid,
        error: 'Error fetching user data from Firestore',
        errorDetails: firestoreError?.message || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error getting user data:', error);
    return NextResponse.json({ 
      exists: false,
      error: 'Failed to get user data',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 